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

  const body = json as { reservationId?: unknown; token?: unknown };
  const token = typeof body?.token === "string" ? body.token.trim() : null;
  const reservationId = Number(body?.reservationId);

  const secret = process.env.STRIPE_SK;
  if (!secret) return apiError.serverError("Stripe not configured");

  // Lookup par token (page publique client) ou par reservationId (tunnel admin)
  const reservation = token
    ? await prisma.reservation.findUnique({
        where: { cautionRequestToken: token },
        select: { id: true, cautionIntentId: true, cautionStatus: true },
      })
    : Number.isInteger(reservationId) && reservationId > 0
    ? await prisma.reservation.findUnique({
        where: { id: reservationId },
        select: { id: true, cautionIntentId: true, cautionStatus: true },
      })
    : null;

  if (!reservation) return apiError.notFound("Réservation introuvable");

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
    where: { id: reservation.id },
    data: { cautionStatus: "HELD" },
  });

  return NextResponse.json({ ok: true, status: "HELD" });
}
