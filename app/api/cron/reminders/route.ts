import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  sendArrivalReminderEmail,
  sendReviewRequestEmail,
} from "@/lib/emails";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { randomBytes } from "crypto";

/**
 * CRON endpoint — GET /api/cron/reminders
 * Protégé par l'en-tête Authorization: Bearer ${CRON_SECRET}.
 * Déclenché quotidiennement par Vercel (voir vercel.json).
 *
 * 1. Rappels d'arrivée (J-7) pour les réservations CONFIRMED.
 * 2. Demandes d'avis (J+2 à J+7 après checkout) pour les CONFIRMED
 *    dont le checkout est passé et sans avis encore soumis.
 *    Génère automatiquement le reviewToken si absent.
 */
export async function GET(request: NextRequest) {
  // ── Auth ─────────────────────────────────────────────────────────────────
  // Vercel Cron envoie : Authorization: Bearer ${CRON_SECRET}
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    logger.warn("Unauthorized cron call", {
      route: "/api/cron/reminders",
      hasHeader: !!authHeader,
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://www.villareel.com";
  const contactEmail =
    process.env.CONTACT_EMAIL ?? "contact@villareel.com";
  const today = new Date();

  let arrivalsSent = 0;
  let reviewsSent = 0;

  // ── 1. Rappels d'arrivée (check-in dans exactement 7 jours) ─────────────
  try {
    const targetDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 7,
    );
    const nextDay = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate() + 1,
    );

    const upcomingReservations = await prisma.reservation.findMany({
      where: {
        status: "CONFIRMED",
        checkIn: { gte: targetDate, lt: nextDay },
      },
    });

    for (const reservation of upcomingReservations) {
      try {
        const locale = reservation.locale === "EN" ? "en" : "fr";
        const dateLocale = locale === "fr" ? fr : enUS;

        await sendArrivalReminderEmail({
          locale,
          to: reservation.guestEmail,
          confirmationCode: reservation.confirmationCode,
          checkIn: format(reservation.checkIn, "EEEE d MMMM yyyy", {
            locale: dateLocale,
          }),
          contactPhone: "+33 6 88 42 30 52",
          contactEmail,
        });
        arrivalsSent++;
      } catch (error) {
        logger.error("Failed to send arrival reminder", {
          route: "/api/cron/reminders",
          reservationId: reservation.id,
          error,
        });
      }
    }
  } catch (error) {
    logger.error("Error fetching upcoming reservations", {
      route: "/api/cron/reminders",
      error,
    });
  }

  // ── 2. Demandes d'avis (checkout entre 1 et 7 jours dans le passé) ──────
  //
  // Fenêtre élargie pour rattraper les jours où le cron n'aurait pas tourné.
  // Garde-fou : reviewToken IS NULL → on ne renvoie pas si déjà envoyé.
  try {
    // Borne haute : il y a 1 jour (laisser le client poser ses valises)
    const targetCheckoutMax = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 1,
    );
    // Borne basse : il y a 7 jours (au-delà, c'est trop tard)
    const targetCheckoutMin = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 7,
    );

    const completedReservations = await prisma.reservation.findMany({
      where: {
        status: "CONFIRMED",
        checkOut: { gte: targetCheckoutMin, lt: targetCheckoutMax },
        reviewToken: null,   // Pas encore envoyé
        review: null,        // Pas d'avis soumis
      },
    });

    for (const reservation of completedReservations) {
      try {
        // 1. Générer un token unique (même format que generate-token)
        const token = randomBytes(32).toString("hex");

        // 2. L'enregistrer en DB
        await prisma.reservation.update({
          where: { id: reservation.id },
          data: { reviewToken: token },
        });

        // 3. Construire le lien (URL /avis/ et pas /review/)
        const locale = reservation.locale === "EN" ? "en" : "fr";
        const reviewUrl = `${appUrl}/${locale}/avis/${token}`;

        // 4. Envoyer l'email
        await sendReviewRequestEmail({
          locale,
          to: reservation.guestEmail,
          guestName: reservation.guestName.split(" ")[0],
          reviewUrl,
        });

        reviewsSent++;

        logger.info("Review request sent", {
          route: "/api/cron/reminders",
          reservationId: reservation.id,
          confirmationCode: reservation.confirmationCode,
        });
      } catch (error) {
        logger.error("Failed to send review request", {
          route: "/api/cron/reminders",
          reservationId: reservation.id,
          error,
        });
      }
    }
  } catch (error) {
    logger.error("Error fetching completed reservations", {
      route: "/api/cron/reminders",
      error,
    });
  }

  logger.info("CRON reminders completed", {
    route: "/api/cron/reminders",
    arrivalsSent,
    reviewsSent,
  });

  return NextResponse.json({ arrivalsSent, reviewsSent });
}