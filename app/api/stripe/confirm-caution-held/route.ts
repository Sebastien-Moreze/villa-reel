import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/http-error";

/**
 * Appelé par le frontend après que le PaymentIntent caution
 * est passé à "requires_capture". Met à jour cautionStatus = HELD.
 */
export async function POST(request: Request) {
  let json: unknown;
  try { json = await request.json(); } catch { return apiError.badRequest("Invalid JSON"); }

  const body = json as { reservationId?: unknown };
  const reservationId = Number(body?.reservationId);
  if (!Number.isInteger(reservationId) || reservationId <= 0) {
    return apiError.badRequest("reservationId invalide");
  }

  const secret = process.env.STRIPE_SK;
  if (!secret) return apiError.serverError("Stripe not configured");

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    select: { cautionIntentId: true, cautionStatus: true },
  });

  if (!reservation?.cautionIntentId) return apiError.notFound("No caution intent found");
  if (reservation.cautionStatus === "HELD") {
    return NextResponse.json({ ok: true, status: "HELD" }); // idempotent
  }

  const stripe = new Stripe(secret, { apiVersion: "2026-02-25.clover" });
  const intent = await stripe.paymentIntents.retrieve(reservation.cautionIntentId);

  if (intent.status !== "requires_capture") {
    return apiError.badRequest(`Intent status is ${intent.status}, expected requires_capture`);
  }

  await prisma.reservation.update({
    where: { id: reservationId },
    data: { cautionStatus: "HELD" },
  });

  return NextResponse.json({ ok: true, status: "HELD" });
}
