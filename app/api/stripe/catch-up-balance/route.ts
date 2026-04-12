import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/http-error";
import { sendBalanceReminderEmail } from "@/lib/emails";

function verifyCronSecret(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const customHeader = request.headers.get("x-cron-secret");
  if (!cronSecret) return false;
  if (authHeader === `Bearer ${cronSecret}`) return true;
  if (customHeader === cronSecret) return true;
  return false;
}

async function handleCatchUp() {
  const secret = process.env.STRIPE_SK;
  if (!secret) return apiError.serverError("Stripe secret key not configured");

  const stripe = new Stripe(secret, { apiVersion: "2026-02-25.clover" });
  const now = new Date();
  const cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 35);

  const missed = await prisma.reservation.findMany({
    where: {
      checkIn: { gt: now, lte: cutoff },
      paymentStatus: { in: ["AWAITING", "DEPOSIT_PAID"] },      status: { in: ["PENDING", "CONFIRMED"] },
      stripePaymentIntentId: null,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://villareel.com";
  let processed = 0;
  const errors: { reservationId: number; error: string }[] = [];

  for (const reservation of missed) {
    const balanceAmount = Number(reservation.balanceAmount ?? reservation.totalAmount ?? 0);
    if (balanceAmount <= 0) continue;

    try {
      const intent = await stripe.paymentIntents.create({
        amount: Math.round(balanceAmount * 100),
        currency: "eur",
        automatic_payment_methods: { enabled: true },
        metadata: {
          reservationId: String(reservation.id),
          villaId: String(reservation.villaId),
          type: "balance",
          source: "catch-up",
        },
      });

      await prisma.reservation.update({
        where: { id: reservation.id },
        data: { stripePaymentIntentId: intent.id },      });

      const locale = reservation.locale === "EN" ? "en" : "fr";
      const balanceDue = new Date(reservation.checkIn);
      balanceDue.setDate(balanceDue.getDate() - 30);

      await sendBalanceReminderEmail({
        locale,
        to: reservation.guestEmail,
        confirmationCode: reservation.confirmationCode,
        balanceAmount,
        balanceDueDate: balanceDue.toLocaleDateString("fr-FR"),
        paymentUrl: `${appUrl}/reservation/solde/${reservation.confirmationCode}`,
      });

      processed++;
      logger.info("Catch-up: balance email sent", {
        reservationId: reservation.id,
        confirmationCode: reservation.confirmationCode,
        guestEmail: reservation.guestEmail,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      errors.push({ reservationId: reservation.id, error: msg });
      logger.error("Catch-up: failed to process reservation", {
        route: "/api/stripe/catch-up-balance",
        reservationId: reservation.id,
        error,
      });
    }  }

  return NextResponse.json({
    found: missed.length,
    processed,
    errors: errors.length > 0 ? errors : undefined,
  });
}

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) return apiError.unauthorized();
  return handleCatchUp();
}

export async function POST(request: NextRequest) {
  if (!verifyCronSecret(request)) return apiError.unauthorized();
  return handleCatchUp();
}