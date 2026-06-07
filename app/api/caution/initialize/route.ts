import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/http-error";

/**
 * Public : récupérer le clientSecret Stripe à partir du token caution.
 * Appelé par la page /[locale]/caution/[token] au montage.
 */
export async function POST(request: Request) {
  let json: unknown;
  try { json = await request.json(); } catch { return apiError.badRequest("Invalid JSON"); }

  const body = json as { token?: unknown };
  const token = typeof body?.token === "string" ? body.token.trim() : null;
  if (!token) return apiError.badRequest("Token manquant");

  const reservation = await prisma.reservation.findUnique({
    where: { cautionRequestToken: token },
    select: {
      id: true,
      cautionIntentId: true,
      cautionStatus: true,
      cautionDeadline: true,
      cautionAmount: true,
      guestName: true,
      confirmationCode: true,
      villa: { select: { nameFr: true, nameEn: true } },
    },
  });

  if (!reservation) return apiError.notFound("Lien invalide ou expiré");
  if (reservation.cautionStatus === "HELD") {
    return NextResponse.json({ alreadyDone: true });
  }
  if (reservation.cautionStatus === "CAPTURED") {
    return NextResponse.json({ alreadyDone: true });
  }
  if (reservation.cautionDeadline && new Date() > reservation.cautionDeadline) {
    return apiError.badRequest("Ce lien a expiré");
  }
  if (!reservation.cautionIntentId) return apiError.serverError("Aucun intent caution trouvé");

  const secret = process.env.STRIPE_SK;
  if (!secret) return apiError.serverError("Stripe not configured");

  const stripe = new Stripe(secret, { apiVersion: "2026-02-25.clover" });
  const intent = await stripe.paymentIntents.retrieve(reservation.cautionIntentId);

  // Si l'intent est déjà annulé/capturé côté Stripe, on retourne alreadyDone
  if (intent.status === "succeeded" || intent.status === "canceled") {
    return NextResponse.json({ alreadyDone: true });
  }

  return NextResponse.json({
    clientSecret: intent.client_secret,
    cautionAmount: Number(reservation.cautionAmount),
    guestName: reservation.guestName,
    confirmationCode: reservation.confirmationCode,
    villaName: reservation.villa.nameFr,
  });
}
