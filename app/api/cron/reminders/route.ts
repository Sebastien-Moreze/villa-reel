import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  sendArrivalReminderEmail,
  sendReviewRequestEmail,
} from "@/lib/emails";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";

/**
 * CRON endpoint — POST /api/cron/reminders
 * Protected by CRON_SECRET header.
 *
 * 1. Sends arrival reminders (J-7) for CONFIRMED reservations.
 * 2. Sends review requests (J+2 after checkout) for COMPLETED reservations
 *    that have a reviewToken but no review yet.
 *
 * Call daily via cPanel CRON:
 *   curl -s -X POST https://villareel.com/api/cron/reminders \
 *        -H "x-cron-secret: $CRON_SECRET"
 */
export async function POST(request: NextRequest) {
  // ── Auth ───────────────────────────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("x-cron-secret");

  if (!cronSecret || authHeader !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://villareel.com";
  const contactEmail = process.env.CONTACT_EMAIL ?? "contact@villareel.com";

  const today = new Date();
  let arrivalsSent = 0;
  let reviewsSent = 0;

  // ── 1. Arrival reminders (check-in in exactly 7 days) ────────────────────
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

  // ── 2. Review requests (checkout was 2 days ago) ─────────────────────────
  try {
    const targetCheckout = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 2,
    );
    const nextDay = new Date(
      targetCheckout.getFullYear(),
      targetCheckout.getMonth(),
      targetCheckout.getDate() + 1,
    );

    const completedReservations = await prisma.reservation.findMany({
      where: {
        status: "COMPLETED",
        checkOut: { gte: targetCheckout, lt: nextDay },
        reviewToken: { not: null },
        review: null, // No review submitted yet
      },
    });

    for (const reservation of completedReservations) {
      try {
        const locale = reservation.locale === "EN" ? "en" : "fr";
        const reviewUrl = `${appUrl}/${locale}/review/${reservation.reviewToken}`;

        await sendReviewRequestEmail({
          locale,
          to: reservation.guestEmail,
          guestName: reservation.guestName.split(" ")[0],
          reviewUrl,
        });
        reviewsSent++;
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
