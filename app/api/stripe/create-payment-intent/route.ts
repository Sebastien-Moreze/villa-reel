import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/http-error";

/* ── Schéma Zod strict ────────────────────────────────────────────
   La devise n'est PAS acceptée du client — elle est fixée à "eur"
   côté serveur pour éviter toute manipulation de prix / devise.    */
const schema = z.object({
  reservationId: z.number().int().positive(),
  villaId: z.number().int().positive(),
  type: z.enum(["deposit", "balance"]).default("deposit"),
});

export async function POST(request: Request) {
  /* ── Rate limiting : 10 tentatives / IP / minute ──────────────── */
  const ip = getClientIp(request);
  if (!rateLimit(`stripe-pi:${ip}`, 10, 60_000)) {
    return apiError.tooManyRequests();
  }

  /* ── Parse + validation Zod ───────────────────────────────────── */
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return apiError.badRequest("Invalid JSON");
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return apiError.badRequest("Payload invalide");
  }

  const { reservationId, villaId, type } = parsed.data;

  /* ── Clés Stripe ──────────────────────────────────────────────── */
  const secret = process.env.STRIPE_SK;
  if (!secret) {
    logger.error("STRIPE_SK not configured");
    return apiError.serverError("Stripe non configuré");
  }

  const stripe = new Stripe(secret, { apiVersion: "2026-02-25.clover" });

  /* ── Lire le montant depuis la DB — JAMAIS depuis le client ────── */
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    select: {
      id: true,
      villaId: true,
      depositAmount: true,
      balanceAmount: true,
      status: true,
    },
  });

  if (!reservation) {
    return apiError.notFound("Réservation introuvable");
  }

  /* Vérifier l'appartenance à la villa */
  if (reservation.villaId !== villaId) {
    return apiError.forbidden();
  }

  if (reservation.status === "CANCELLED") {
    return apiError.badRequest("Réservation annulée");
  }

  /* Montant calculé côté serveur (en centimes) */
  const serverAmount =
    type === "balance"
      ? Math.round(Number(reservation.balanceAmount) * 100)
      : Math.round(Number(reservation.depositAmount) * 100);

  if (!serverAmount || serverAmount <= 0) {
    return apiError.badRequest("Montant invalide");
  }

  try {
    const intent = await stripe.paymentIntents.create({
      amount: serverAmount,
      currency: "eur", /* Devise forcée côté serveur */
      automatic_payment_methods: { enabled: true },
      metadata: {
        reservationId: String(reservationId),
        villaId: String(villaId),
        type,
      },
    });

    return NextResponse.json({ clientSecret: intent.client_secret });
  } catch (error) {
    logger.error("Failed to create payment intent", {
      route: "/api/stripe/create-payment-intent",
      reservationId,
      error,
    });
    return apiError.serverError("Erreur Stripe");
  }
}
