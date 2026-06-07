import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { requireAuth, isAdmin } from "@/lib/auth";
import { apiError } from "@/lib/http-error";
import { logger } from "@/lib/logger";
import { Resend } from "resend";
import { escapeHtml } from "@/lib/html";

/**
 * Admin : envoyer une demande de pré-autorisation caution au client.
 * Crée un PaymentIntent Stripe (capture_method: manual) + token one-use
 * + email au client avec le lien vers /[locale]/caution/[token].
 */
export async function POST(request: Request) {
  try {
    await requireAuth();
  } catch {
    return apiError.unauthorized();
  }
  if (!(await isAdmin())) return apiError.forbidden("Admin access required");

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
    include: { villa: true },
  });

  if (!reservation) return apiError.notFound("Réservation introuvable");
  if (reservation.status === "CANCELLED") return apiError.badRequest("Réservation annulée");
  if (reservation.cautionStatus === "HELD") return apiError.badRequest("Caution déjà provisionnée");
  if (reservation.cautionStatus === "CAPTURED") return apiError.badRequest("Caution déjà encaissée");

  const cautionCents = Math.round(Number(reservation.villa.deposit) * 100);
  if (cautionCents <= 0) return apiError.badRequest("Montant caution invalide");

  const stripe = new Stripe(secret, { apiVersion: "2026-02-25.clover" });

  // ── 1. Créer le PaymentIntent caution (autorisation manuelle) ─────────────
  const intent = await stripe.paymentIntents.create({
    amount: cautionCents,
    currency: "eur",
    capture_method: "manual",
    automatic_payment_methods: { enabled: true },
    metadata: {
      reservationId: String(reservationId),
      villaId: String(reservation.villaId),
      type: "caution-hold",
    },
  });

  // Deadline : 7 jours à partir de maintenant (client a le temps de payer)
  const cautionDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // ── 2. Générer un token one-use ───────────────────────────────────────────
  const token = randomBytes(32).toString("hex");

  // ── 3. Persister en DB ───────────────────────────────────────────────────
  await prisma.reservation.update({
    where: { id: reservationId },
    data: {
      cautionIntentId: intent.id,
      cautionAmount: Number(reservation.villa.deposit),
      cautionStatus: "NONE",
      cautionDeadline,
      cautionRequestToken: token,
      cautionRequestSentAt: new Date(),
    },
  });

  // ── 4. Envoyer l'email au client ──────────────────────────────────────────
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.CONTACT_EMAIL;

  if (resendKey && fromEmail) {
    const resend = new Resend(resendKey);
    const locale = reservation.locale === "EN" ? "en" : "fr";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://villareel.com";
    const cautionUrl = `${appUrl}/${locale}/caution/${token}`;
    const cautionAmount = Number(reservation.villa.deposit).toLocaleString("fr-FR");
    const isFr = locale === "fr";

    const subject = isFr
      ? `Autorisation de caution requise – Villa R.E.E.L (${reservation.confirmationCode})`
      : `Security deposit authorization required – Villa R.E.E.L (${reservation.confirmationCode})`;

    const html = isFr
      ? `
        <p>Bonjour ${escapeHtml(reservation.guestName)},</p>
        <p>Dans le cadre de votre séjour à la Villa R.E.E.L (réservation <strong>${escapeHtml(reservation.confirmationCode)}</strong>),
        nous vous demandons d'autoriser une empreinte bancaire de <strong>${cautionAmount} €</strong> à titre de caution.</p>
        <p><strong>Cette somme ne sera pas débitée</strong> — elle sera simplement bloquée sur votre carte,
        puis libérée après votre départ si tout est en ordre.</p>
        <p style="margin:24px 0">
          <a href="${escapeHtml(cautionUrl)}"
             style="background:#2d6a4f;color:#fff;padding:12px 24px;border-radius:24px;text-decoration:none;font-weight:600;">
            Autoriser la caution de ${cautionAmount} €
          </a>
        </p>
        <p style="color:#888;font-size:12px">Ce lien est valable 7 jours. Si vous avez des questions, n'hésitez pas à nous contacter.</p>
        <p>Cordialement,<br/>Estelle &amp; Rodrigue – Villa R.E.E.L</p>
      `
      : `
        <p>Hello ${escapeHtml(reservation.guestName)},</p>
        <p>As part of your stay at Villa R.E.E.L (booking <strong>${escapeHtml(reservation.confirmationCode)}</strong>),
        we kindly ask you to authorize a security deposit of <strong>${cautionAmount} €</strong>.</p>
        <p><strong>No amount will be charged</strong> — your card will simply be put on hold
        and released after your departure if everything is in order.</p>
        <p style="margin:24px 0">
          <a href="${escapeHtml(cautionUrl)}"
             style="background:#2d6a4f;color:#fff;padding:12px 24px;border-radius:24px;text-decoration:none;font-weight:600;">
            Authorize security deposit of ${cautionAmount} €
          </a>
        </p>
        <p style="color:#888;font-size:12px">This link is valid for 7 days. Feel free to contact us with any questions.</p>
        <p>Best regards,<br/>Estelle &amp; Rodrigue – Villa R.E.E.L</p>
      `;

    await resend.emails.send({
      from: `Villa R.E.E.L <${fromEmail}>`,
      to: [reservation.guestEmail],
      subject,
      html,
    });
  }

  logger.info("Caution request sent", {
    reservationId,
    confirmationCode: reservation.confirmationCode,
    intentId: intent.id,
  });

  return NextResponse.json({ ok: true, token });
}
