import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { verifyHCaptcha } from "@/lib/hcaptcha";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/http-error";
import { revalidateTag } from "next/cache";
import { sendReservationConfirmationEmail } from "@/lib/emails";

// ── Schéma d'entrée — AUCUNE donnée financière acceptée du client ─────────────
// Les prix (pricePerNight, cleaningFee, deposit, totalAmount, etc.) sont
// toujours recalculés depuis la base de données. Le client ne peut pas
// manipuler les montants.
const reservationSchema = z.object({
  villaId: z.number().int().positive(),
  checkIn: z.string().nonempty(),
  checkOut: z.string().nonempty(),
  nbGuests: z.number().int().positive().max(50),
  guestName: z.string().min(1).max(200).trim(),
  guestEmail: z.string().email().max(200),
  guestPhone: z.string().max(30).optional(),
  guestAddress: z.string().max(500).optional(),
  promoCode: z.string().max(50).nullish(),
  locale: z.enum(["fr", "en"]).default("fr"),
  hcaptchaToken: z.string().optional(),
});

function overlaps(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date,
): boolean {
  return startA < endB && startB < endA;
}

export async function POST(request: Request) {
  // ── Rate limiting : 3 créations par IP par 10 minutes (désactivé en dev) ──
  if (process.env.NODE_ENV !== "development") {
    const ip = getClientIp(request);
    if (!rateLimit(`reservations-create:${ip}`, 10, 10 * 60_000)) {
      return apiError.tooManyRequests();
    }
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return apiError.badRequest("Invalid JSON");
  }

  const parsed = reservationSchema.safeParse(json);

  if (!parsed.success) {
    // Ne pas exposer les détails internes de validation
    return apiError.badRequest("Formulaire invalide. Vérifiez vos informations.");
  }

  const data = parsed.data;

  /* ── Vérification hCaptcha (désactivée en dev si HCAPTCHA_SECRET absent) ── */
  const captchaOk = await verifyHCaptcha(data.hcaptchaToken);
  if (!captchaOk) {
    return apiError.badRequest(
      "Vérification anti-spam échouée. Veuillez réessayer.",
      "CAPTCHA_FAILED",
    );
  }

  const checkIn = new Date(data.checkIn);
  const checkOut = new Date(data.checkOut);

  if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
    return apiError.badRequest("Invalid dates");
  }

  if (checkOut <= checkIn) {
    return apiError.badRequest("Check-out must be after check-in");
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // ── 1. Récupérer les tarifs officiels depuis la DB ─────────────────
      const villa = await tx.villa.findUnique({
        where: { id: data.villaId },
        select: {
          id: true,
          nameFr: true,
          nameEn: true,
          pricePerNight: true,
          cleaningFee: true,
          deposit: true,
          minStay: true,
          maxStay: true,
          maxGuests: true,
        },
      });

      if (!villa) {
        throw new Error("VILLA_NOT_FOUND");
      }

      // ── 2. Valider les contraintes de séjour ──────────────────────────
      const nights = Math.round(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (nights < 1) {
        throw new Error("INVALID_DATES");
      }
      if (nights < villa.minStay) {
        throw new Error("MIN_STAY");
      }
      if (villa.maxStay && nights > villa.maxStay) {
        throw new Error("MAX_STAY");
      }
      if (data.nbGuests > villa.maxGuests) {
        throw new Error("TOO_MANY_GUESTS");
      }

      // ── 3. Vérifier les disponibilités ────────────────────────────────
      const [existingBlocked, existingReservations] = await Promise.all([
        tx.blockedDate.findMany({ where: { villaId: data.villaId } }),
        tx.reservation.findMany({
          where: {
            villaId: data.villaId,
            status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
          },
        }),
      ]);

      const hasConflict =
        existingBlocked.some((b) =>
          overlaps(checkIn, checkOut, b.startDate, b.endDate),
        ) ||
        existingReservations.some((r) =>
          overlaps(checkIn, checkOut, r.checkIn, r.checkOut),
        );

      if (hasConflict) {
        throw new Error("DATES_UNAVAILABLE");
      }

      // ── 4. Calculer les montants côté serveur (JAMAIS depuis le client) ─
      const pricePerNight = Number(villa.pricePerNight);
      const cleaningFee = Number(villa.cleaningFee);
      const _depositAmount = Number(villa.deposit); // conservé pour référence future

      let discount = 0;
      let promoCodeRecord: { id: number } | null = null;

      if (data.promoCode) {
        const normalizedCode = data.promoCode.toUpperCase().trim();
        const promo = await tx.promoCode.findUnique({
          where: { code: normalizedCode },
        });

        const now = new Date();
        if (
          promo &&
          promo.isActive &&
          (!promo.startDate || promo.startDate <= now) &&
          (!promo.endDate || promo.endDate >= now) &&
          (!promo.minNights || nights >= promo.minNights)
        ) {
          const baseTotal = nights * pricePerNight + cleaningFee;
          if (promo.type === "PERCENT") {
            discount = Math.round((baseTotal * Number(promo.value)) / 100);
          } else {
            discount = Number(promo.value);
          }
          // S'assurer que la remise ne dépasse pas le total
          discount = Math.min(discount, baseTotal);
          promoCodeRecord = promo;
        }
      }

      const totalAmount = Math.max(
        nights * pricePerNight + cleaningFee - discount,
        0,
      );
      // Pas d'acompte à la réservation — paiement intégral 30 jours avant l'arrivée
      const balanceAmount = totalAmount;

      // ── 5. Créer la réservation ───────────────────────────────────────
      const confirmationCode = await generateUniqueConfirmationCode(tx);

      const reservation = await tx.reservation.create({
        data: {
          villaId: data.villaId,
          confirmationCode,
          guestName: data.guestName,
          guestEmail: data.guestEmail,
          guestPhone: data.guestPhone,
          guestAddress: data.guestAddress,
          checkIn,
          checkOut,
          nbGuests: data.nbGuests,
          nbNights: nights,
          pricePerNight,
          cleaningFee,
          discount,
          totalAmount,
          depositAmount: 0, // Pas d'acompte — paiement intégral 30j avant arrivée
          balanceAmount,
          status: "PENDING",
          paymentStatus: "AWAITING",
          promoCodeId: promoCodeRecord?.id,
          locale: data.locale === "en" ? "EN" : "FR",
        },
      });

      return { reservation, villaName: data.locale === "en" ? (villa.nameEn ?? villa.nameFr) : villa.nameFr };
    });

    // ── Invalider le cache des disponibilités ────────────────────────────
    revalidateTag("availability", "max");

    // ── Envoyer l'email de confirmation ─────────────────────────────────
    try {
      const balanceDue = new Date(result.reservation.checkIn);
      balanceDue.setDate(balanceDue.getDate() - 30);

      await sendReservationConfirmationEmail({
        locale: data.locale,
        to: result.reservation.guestEmail,
        confirmationCode: result.reservation.confirmationCode,
        checkIn: result.reservation.checkIn.toLocaleDateString("fr-FR"),
        checkOut: result.reservation.checkOut.toLocaleDateString("fr-FR"),
        villaName: result.villaName ?? "Villa R.E.E.L",
        totalAmount: Number(result.reservation.totalAmount),
        depositAmount: 0,
        balanceAmount: Number(result.reservation.balanceAmount ?? result.reservation.totalAmount),
        balanceDueDate: balanceDue.toLocaleDateString("fr-FR"),
      });
    } catch (emailErr) {
      // L'email ne doit pas faire échouer la réservation
      logger.error("Failed to send confirmation email", { error: emailErr });
    }

    return NextResponse.json({
      reservationId: result.reservation.id,
      confirmationCode: result.reservation.confirmationCode,
      totalAmount: Number(result.reservation.totalAmount),
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      switch (error.message) {
        case "DATES_UNAVAILABLE":
          return apiError.conflict("Dates not available");
        case "VILLA_NOT_FOUND":
          return apiError.notFound("Villa not found");
        case "MIN_STAY":
          return apiError.badRequest("Minimum stay not met");
        case "MAX_STAY":
          return apiError.badRequest("Maximum stay exceeded");
        case "TOO_MANY_GUESTS":
          return apiError.badRequest("Too many guests for this villa");
        case "INVALID_DATES":
          return apiError.badRequest("Invalid dates");
      }
    }
    logger.error("Reservation creation error", {
      route: "/api/reservations/create",
      error,
    });
    return apiError.serverError("Failed to create reservation");
  }
}

async function generateUniqueConfirmationCode(tx: Prisma.TransactionClient) {
  // Cryptographiquement aléatoire via crypto.getRandomValues
  for (let attempts = 0; attempts < 10; attempts++) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const random = (array[0] % 1_000_000).toString().padStart(6, "0");
    const code = `REEL-${random}`;
    const existing = await tx.reservation.findUnique({
      where: { confirmationCode: code },
    });
    if (!existing) return code;
  }
  throw new Error("Failed to generate unique confirmation code");
}
