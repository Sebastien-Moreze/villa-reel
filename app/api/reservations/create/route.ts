import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

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
  promoCode: z.string().max(50).optional(),
  locale: z.enum(["fr", "en"]).default("fr"),
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
  // ── Rate limiting : 3 créations par IP par 10 minutes ───────────────────
  const ip = getClientIp(request);
  if (!rateLimit(`reservations-create:${ip}`, 3, 10 * 60_000)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = reservationSchema.safeParse(json);

  if (!parsed.success) {
    // Ne pas exposer les détails internes de validation
    return NextResponse.json(
      { error: "Formulaire invalide. Vérifiez vos informations." },
      { status: 400 },
    );
  }

  const data = parsed.data;

  const checkIn = new Date(data.checkIn);
  const checkOut = new Date(data.checkOut);

  if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
    return NextResponse.json({ error: "Invalid dates" }, { status: 400 });
  }

  if (checkOut <= checkIn) {
    return NextResponse.json(
      { error: "Check-out must be after check-in" },
      { status: 400 },
    );
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // ── 1. Récupérer les tarifs officiels depuis la DB ─────────────────
      const villa = await tx.villa.findUnique({
        where: { id: data.villaId },
        select: {
          id: true,
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
      const depositAmount = Number(villa.deposit);

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
      const balanceAmount = Math.max(totalAmount - depositAmount, 0);

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
          depositAmount,
          balanceAmount,
          status: "PENDING",
          paymentStatus: "AWAITING",
          promoCodeId: promoCodeRecord?.id,
          locale: data.locale === "en" ? "EN" : "FR",
        },
      });

      return reservation;
    });

    return NextResponse.json({
      reservationId: result.id,
      confirmationCode: result.confirmationCode,
      // Retourner le depositAmount calculé côté serveur pour affichage
      depositAmount: Number(result.depositAmount),
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      switch (error.message) {
        case "DATES_UNAVAILABLE":
          return NextResponse.json({ error: "Dates not available" }, { status: 409 });
        case "VILLA_NOT_FOUND":
          return NextResponse.json({ error: "Villa not found" }, { status: 404 });
        case "MIN_STAY":
          return NextResponse.json({ error: "Minimum stay not met" }, { status: 400 });
        case "MAX_STAY":
          return NextResponse.json({ error: "Maximum stay exceeded" }, { status: 400 });
        case "TOO_MANY_GUESTS":
          return NextResponse.json({ error: "Too many guests for this villa" }, { status: 400 });
        case "INVALID_DATES":
          return NextResponse.json({ error: "Invalid dates" }, { status: 400 });
      }
    }
    console.error("Reservation creation error:", error);
    return NextResponse.json(
      { error: "Failed to create reservation" },
      { status: 500 },
    );
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
