import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/http-error";

export async function POST(request: Request) {
  // ── Rate limiting : 5 tentatives par IP par minute ───────────────────────
  const ip = getClientIp(request);
  if (!rateLimit(`deposit-intent:${ip}`, 15, 60_000)) {
    return apiError.tooManyRequests();
  }

  let json: unknown;
  try { json = await request.json(); } catch { return apiError.badRequest("Invalid JSON"); }

  const body = json as { reservationId?: unknown };
  const reservationId = Number(body?.reservationId);
  if (!Number.isInteger(reservationId) || reservationId <= 0) {
    return apiError.badRequest("reservationId invalide");
  }

  const secret = process.env.STRIPE_SK;
  if (!secret) {
    return apiError.serverError("Stripe not configured");
  }

  // ── Le montant est toujours lu en DB, jamais fourni par le client ─────────
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    select: {
      id: true,
      villaId: true,
      totalAmount: true,
      balanceAmount: true,
      checkOut: true,
      status: true,
      paymentStatus: true,
    },
  });

  if (!reservation) return apiError.notFound("Reservation not found");
  if (reservation.status === "CANCELLED") return apiError.badRequest("Reservation is cancelled");
  if (reservation.paymentStatus === "FULLY_PAID") return apiError.badRequest("Reservation already fully paid");

  // Montant total du séjour (pas d'acompte — paiement intégral)
  const totalCents = Math.round(Number(reservation.balanceAmount ?? reservation.totalAmount) * 100);
  if (!totalCents || totalCents <= 0) return apiError.badRequest("Invalid payment amount");

  // Montant caution (lu depuis la villa — jamais depuis le client)
  const villa = await prisma.villa.findUnique({
    where: { id: reservation.villaId },
    select: { deposit: true },
  });
  const cautionCents = Math.round(Number(villa?.deposit ?? 0) * 100);

  const stripe = new Stripe(secret, { apiVersion: "2026-02-25.clover" });

  try {
    // ── 1. PaymentIntent principal — capture immédiate ────────────────────
    const mainIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: "eur",
      automatic_payment_methods: { enabled: true },
      metadata: {
        reservationId: String(reservation.id),
        villaId: String(reservation.villaId),
        type: "stay-payment",
      },
    });

    // ── 2. PaymentIntent caution — autorisation sans capture ─────────────
    let cautionIntent: Stripe.PaymentIntent | null = null;
    if (cautionCents > 0) {
      cautionIntent = await stripe.paymentIntents.create({
        amount: cautionCents,
        currency: "eur",
        capture_method: "manual",           // ← autorisation uniquement, pas de débit
        automatic_payment_methods: { enabled: true },
        metadata: {
          reservationId: String(reservation.id),
          villaId: String(reservation.villaId),
          type: "caution-hold",
        },
      });

      // Deadline : checkout + 48 h
      const cautionDeadline = new Date(reservation.checkOut.getTime() + 48 * 60 * 60 * 1000);

      // Persistance de l'ID de l'intent caution en DB
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: {
          cautionIntentId: cautionIntent.id,
          cautionAmount: Number(villa!.deposit),
          cautionStatus: "NONE",            // devient HELD après confirmation côté client
          cautionDeadline,
        },
      });
    }

    return NextResponse.json({
      clientSecret: mainIntent.client_secret,
      cautionClientSecret: cautionIntent?.client_secret ?? null,
      cautionAmount: cautionCents > 0 ? Number(villa!.deposit) : 0,
    });
  } catch (error) {
    const stripeMsg = error instanceof Error ? error.message : String(error);
    logger.error("Failed to create payment intents", {
      route: "/api/stripe/create-deposit-intent",
      reservationId,
      stripeMessage: stripeMsg,
      error,
    });
    return apiError.serverError(`Failed to create payment intent: ${stripeMsg}`);
  }
}
