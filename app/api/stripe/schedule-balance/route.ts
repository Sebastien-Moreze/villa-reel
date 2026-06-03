import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/http-error";
import { sendBalanceReminderEmail } from "@/lib/emails";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";

/**
 * Cron J-30 — Premier envoi du lien de paiement solde.
 *
 * Envoie un lien PERMANENT (villareel.com/reservation/paiement-solde/...)
 * qui crée la session Stripe à la volée au moment du clic.
 * Ne renvoie jamais à un client qui a déjà reçu ce lien (balanceLinkSentAt).
 */

function verifyCronSecret(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const customHeader = request.headers.get("x-cron-secret");
  if (!cronSecret) return false;
  if (authHeader === `Bearer ${cronSecret}`) return true;
  if (customHeader === cronSecret) return true;
  return false;
}

async function handleScheduleBalance() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://villareel.com";

  const today = new Date();
  const target = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);

  const reservations = await prisma.reservation.findMany({
    where: {
      checkIn: {
        gte: new Date(target.getFullYear(), target.getMonth(), target.getDate()),
        lt:  new Date(target.getFullYear(), target.getMonth(), target.getDate() + 1),
      },
      status: "CONFIRMED",
      paymentStatus: { in: ["AWAITING", "DEPOSIT_PAID"] },
      balanceLinkSentAt: null, // Jamais envoyé
    },
  });

  let scheduled = 0;

  for (const reservation of reservations) {
    const balanceAmount = Number(reservation.balanceAmount ?? reservation.totalAmount ?? 0);
    if (balanceAmount <= 0) continue;

    try {
      const locale = reservation.locale === "EN" ? "en" : "fr";
      const dateLocale = locale === "fr" ? fr : enUS;

      const balanceDue = new Date(reservation.checkIn);
      balanceDue.setDate(balanceDue.getDate() - 30);

      // Lien permanent — pas de session Stripe créée à l'avance
      const paymentUrl = `${appUrl}/${locale}/reservation/paiement-solde/${reservation.confirmationCode}`;

      await sendBalanceReminderEmail({
        locale,
        to: reservation.guestEmail,
        confirmationCode: reservation.confirmationCode,
        balanceAmount,
        balanceDueDate: format(balanceDue, "d MMMM yyyy", { locale: dateLocale }),
        paymentUrl,
      });

      // Marque l'envoi pour éviter les doublons
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: { balanceLinkSentAt: new Date() },
      });

      scheduled++;
    } catch (error) {
      logger.error("schedule-balance: échec envoi", {
        reservationId: reservation.id,
        error,
      });
    }
  }

  return NextResponse.json({ scheduled, total: reservations.length });
}

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) return apiError.unauthorized();
  return handleScheduleBalance();
}

export async function POST(request: NextRequest) {
  if (!verifyCronSecret(request)) return apiError.unauthorized();
  return handleScheduleBalance();
}
