import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/http-error";

export async function POST(request: NextRequest) {
  // ── Authentification CRON_SECRET ─────────────────────────────────────────
  // Cet endpoint est appelé par le scheduler (cron). Il doit être protégé
  // pour éviter qu'un tiers ne déclenche des PaymentIntents arbitraires.
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("x-cron-secret");

  if (!cronSecret || authHeader !== cronSecret) {
    return apiError.unauthorized();
  }

  const secret = process.env.STRIPE_SK;
  if (!secret) {
    return apiError.serverError("Stripe secret key not configured");
  }

  const stripe = new Stripe(secret, {
    apiVersion: "2026-02-25.clover",
  });

  const today = new Date();
  const target = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 30,
  );

  const reservations = await prisma.reservation.findMany({
    where: {
      checkIn: {
        gte: new Date(
          target.getFullYear(),
          target.getMonth(),
          target.getDate(),
        ),
        lt: new Date(
          target.getFullYear(),
          target.getMonth(),
          target.getDate() + 1,
        ),
      },
      paymentStatus: "DEPOSIT_PAID",
    },
  });

  for (const reservation of reservations) {
    const balanceAmount = Number(reservation.balanceAmount ?? 0);
    if (balanceAmount <= 0) continue;

    try {
      const intent = await stripe.paymentIntents.create({
        amount: Math.round(Number(balanceAmount) * 100),
        currency: "eur",
        automatic_payment_methods: { enabled: true },
        metadata: {
          reservationId: String(reservation.id),
          villaId: String(reservation.villaId),
          type: "balance",
        },
      });

      await prisma.reservation.update({
        where: { id: reservation.id },
        data: { stripePaymentIntentId: intent.id },
      });
    } catch (error) {
      logger.error("Failed to create balance payment intent", {
        route: "/api/stripe/schedule-balance",
        reservationId: reservation.id,
        villaId: reservation.villaId,
        error,
      });
    }
  }

  return NextResponse.json({ scheduled: reservations.length });
}

