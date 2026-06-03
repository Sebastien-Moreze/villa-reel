import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/http-error";
import { sendBalanceReminderEmail } from "@/lib/emails";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";

/**
 * Cron J-7 — Rappel unique de paiement du solde.
 *
 * Envoie un rappel aux clients qui n'ont pas encore payé leur solde
 * 7 jours avant le check-in, et qui n'ont pas encore reçu ce rappel.
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

async function handleBalanceReminder7Days() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://villareel.com";
  const today = new Date();
  const target = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);

  const reservations = await prisma.reservation.findMany({
    where: {
      checkIn: {
        gte: new Date(target.getFullYear(), target.getMonth(), target.getDate()),
        lt:  new Date(target.getFullYear(), target.getMonth(), target.getDate() + 1),
      },
      status: "CONFIRMED",
      paymentStatus: { in: ["AWAITING", "DEPOSIT_PAID"] },
      balanceReminderSentAt: null,
    },
  });

  let reminded = 0;

  for (const reservation of reservations) {
    const balanceAmount = Number(reservation.balanceAmount ?? reservation.totalAmount ?? 0);
    if (balanceAmount <= 0) continue;

    try {
      const locale = reservation.locale === "EN" ? "en" : "fr";
      const dateLocale = locale === "fr" ? fr : enUS;
      const balanceDue = new Date(reservation.checkIn);
      balanceDue.setDate(balanceDue.getDate() - 7);
      const paymentUrl = `${appUrl}/${locale}/reservation/paiement-solde/${reservation.confirmationCode}`;

      await sendBalanceReminderEmail({
        locale,
        to: reservation.guestEmail,
        confirmationCode: reservation.confirmationCode,
        balanceAmount,
        balanceDueDate: format(balanceDue, "d MMMM yyyy", { locale: dateLocale }),
        paymentUrl,
      });

      await prisma.reservation.update({
        where: { id: reservation.id },
        data: { balanceReminderSentAt: new Date() },
      });

      reminded++;
    } catch (error) {
      logger.error("balance-reminder-7days: échec envoi", {
        reservationId: reservation.id,
        error,
      });
    }
  }

  return NextResponse.json({ reminded, total: reservations.length });
}

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) return apiError.unauthorized();
  return handleBalanceReminder7Days();
}

export async function POST(request: NextRequest) {
  if (!verifyCronSecret(request)) return apiError.unauthorized();
  return handleBalanceReminder7Days();
}
