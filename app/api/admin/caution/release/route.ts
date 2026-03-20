import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { requireAuth, isAdmin } from "@/lib/auth";
import { apiError } from "@/lib/http-error";
import { logger } from "@/lib/logger";

/**
 * Admin : libérer (annuler) la caution provisionnée.
 * Le voyageur ne sera pas débité.
 */
export async function POST(request: Request) {
  try {
    await requireAuth();
  } catch {
    return apiError.unauthorized();
  }
  const admin = await isAdmin();
  if (!admin) return apiError.forbidden("Admin access required");

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
    select: {
      cautionIntentId: true,
      cautionStatus: true,
      cautionAmount: true,
    },
  });

  if (!reservation) return apiError.notFound("Reservation not found");
  if (!reservation.cautionIntentId) return apiError.badRequest("Aucune caution associée");
  if (reservation.cautionStatus === "RELEASED") return apiError.badRequest("Caution déjà libérée");
  if (reservation.cautionStatus === "CAPTURED") return apiError.badRequest("Caution déjà capturée — impossible de libérer");
  if (reservation.cautionStatus !== "HELD") return apiError.badRequest("Caution non disponible (statut : " + reservation.cautionStatus + ")");

  const stripe = new Stripe(secret, { apiVersion: "2026-02-25.clover" });

  try {
    await stripe.paymentIntents.cancel(reservation.cautionIntentId);

    await prisma.reservation.update({
      where: { id: reservationId },
      data: { cautionStatus: "RELEASED" },
    });

    logger.info("Caution released", { reservationId, amount: reservation.cautionAmount });
    return NextResponse.json({ ok: true, status: "RELEASED" });
  } catch (error) {
    logger.error("Failed to release caution", { reservationId, error });
    return apiError.serverError("Échec de la libération de la caution");
  }
}
