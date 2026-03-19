import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/http-error";

export async function POST(request: Request) {
  let json: unknown;
  try { json = await request.json(); } catch { return apiError.badRequest("Invalid JSON"); }

  const body = json as { reservationId?: unknown; villaId?: unknown };
  const reservationId = Number(body?.reservationId);
  const villaId = Number(body?.villaId);

  const secret = process.env.STRIPE_SK;
  if (!secret) {
    return apiError.serverError("Stripe secret key not configured");
  }

  const stripe = new Stripe(secret, {
    apiVersion: "2026-02-25.clover",
  });

  if (!Number.isInteger(reservationId) || reservationId <= 0 ||
      !Number.isInteger(villaId) || villaId <= 0) {
    return apiError.badRequest("Payload invalide");
  }

  // ── Validation côté serveur ───────────────────────────────────────────────
  // Le montant n'est JAMAIS fourni par le client — toujours lu depuis la DB.
  const reservation = await prisma.reservation.findUnique({
    where: { id: Number(reservationId) },
    select: {
      id: true,
      villaId: true,
      depositAmount: true,
      status: true,
    },
  });

  if (!reservation) {
    return apiError.notFound("Reservation not found");
  }

  if (reservation.villaId !== Number(villaId)) {
    return apiError.badRequest("Invalid request");
  }

  if (reservation.status === "CANCELLED") {
    return apiError.badRequest("Reservation is cancelled");
  }

  const serverAmount = Math.round(Number(reservation.depositAmount) * 100);

  if (!serverAmount || serverAmount <= 0) {
    return apiError.badRequest("Invalid amount");
  }

  try {
    const intent = await stripe.paymentIntents.create({
      amount: serverAmount,
      currency: "eur", /* Forcé côté serveur */
      capture_method: "manual",
      automatic_payment_methods: { enabled: true },
      metadata: {
        reservationId: String(reservationId),
        villaId: String(villaId),
        type: "deposit-hold",
      },
    });

    return NextResponse.json({ clientSecret: intent.client_secret });
  } catch (error) {
    logger.error("Failed to create deposit hold", {
      route: "/api/stripe/create-deposit-hold",
      reservationId,
      villaId,
      error,
    });
    return apiError.serverError("Failed to create deposit hold");
  }
}
