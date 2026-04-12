import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/http-error";
import { sendBalanceReminderEmail } from "@/lib/emails";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";

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
  const secret = process.env.STRIPE_SK;
  if (!secret) {
    return apiError.serverError("Stripe secret key not configured");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://villareel.com";
  const stripe = new Stripe(secret, {
    apiVersion: "2026-02-25.clover",
  });

  const today = new Date();
  const target = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 30,
  );

  // Cible les réservations avec check-in à J+30, en attente de paiement
  const reservations = await prisma.reservation.findMany({
    where: {
      checkIn: {
        gte: new Date(target.getFullYear(), target.getMonth(), target.getDate()),
        lt: new Date(target.getFullYear(), target.getMonth(), target.getDate() + 1),
      },
      status: "CONFIRMED",
      paymentStatus: "AWAITING",
    },
  });

  let scheduled = 0;

  for (const reservation of reservations) {
    const balanceAmount = Number(reservation.balanceAmount ?? 0);
    if (balanceAmount <= 0) continue;
    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: `Solde séjour Villa R.E.E.L – ${reservation.confirmationCode}`,
              },
              unit_amount: Math.round(balanceAmount * 100),
            },
            quantity: 1,
          },
        ],
        payment_intent_data: {
          metadata: {
            reservationId: String(reservation.id),
            villaId: String(reservation.villaId),
            type: "balance",
          },
        },
        success_url: `${appUrl}/reservation/merci?code=${reservation.confirmationCode}`,
        cancel_url: `${appUrl}/reservation?annule=1`,
        expires_at: Math.floor(Date.now() / 1000) + 72 * 60 * 60,
      });
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: {
          stripePaymentIntentId: session.payment_intent
            ? String(session.payment_intent)
            : session.id,
        },
      });

      const locale = reservation.locale === "EN" ? "en" : "fr";
      const dateLocale = locale === "fr" ? fr : enUS;

      const balanceDue = new Date(reservation.checkIn);
      balanceDue.setDate(balanceDue.getDate() - 30);

      await sendBalanceReminderEmail({
        locale,
        to: reservation.guestEmail,
        confirmationCode: reservation.confirmationCode,
        balanceAmount,
        balanceDueDate: format(balanceDue, "d MMMM yyyy", { locale: dateLocale }),
        paymentUrl: session.url ?? `${appUrl}/reservation`,
      });

      scheduled++;
    } catch (error) {
      logger.error("Failed to create balance checkout session", {
        route: "/api/stripe/schedule-balance",        reservationId: reservation.id,
        villaId: reservation.villaId,
        error,
      });
    }
  }

  return NextResponse.json({ scheduled });
}

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) return apiError.unauthorized();
  return handleScheduleBalance();
}

export async function POST(request: NextRequest) {
  if (!verifyCronSecret(request)) return apiError.unauthorized();
  return handleScheduleBalance();
}