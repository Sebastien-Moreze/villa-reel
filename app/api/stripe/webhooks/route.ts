import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { escapeHtml } from "@/lib/html";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/http-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Mappe le `metadata.type` envoyé par les endpoints de création de PaymentIntent
 * vers la valeur PaymentStatus correspondante en DB.
 *
 * Sources des types possibles :
 *  - "deposit"      → ancien endpoint /api/stripe/create-payment-intent (acompte)
 *  - "balance"      → ancien endpoint /api/stripe/create-payment-intent (solde, cron J-30)
 *  - "stay-payment" → endpoint actuel /api/stripe/create-deposit-intent (paiement intégral)
 *
 * Retourne null pour les types qui ne doivent PAS toucher paymentStatus
 * (ex: "caution-hold" qui concerne uniquement cautionStatus).
 */
function mapPaymentType(
  type: string | undefined,
): "DEPOSIT_PAID" | "FULLY_PAID" | null {
  switch (type) {
    case "deposit":
      return "DEPOSIT_PAID";
    case "balance":
    case "stay-payment":
      return "FULLY_PAID";
    default:
      return null;
  }
}

const isCautionType = (type: string | undefined): boolean =>
  type === "caution-hold";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_SK;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret || !webhookSecret) {
    return apiError.serverError("Stripe webhook not configured");
  }

  const stripe = new Stripe(secret, {
    apiVersion: "2026-02-25.clover",
  });

  const sig = request.headers.get("stripe-signature");
  const rawBody = Buffer.from(await request.arrayBuffer());

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig ?? "", webhookSecret);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown Stripe webhook error";
    logger.error("Stripe webhook signature error", {
      route: "/api/stripe/webhooks",
      detail: message,
    });
    return apiError.badRequest("Invalid signature");
  }

  try {
    switch (event.type) {
      // ════════════════════════════════════════════════════════════════
      // PAIEMENT RÉUSSI
      // Concerne soit le séjour, soit la capture manuelle d'une caution
      // ════════════════════════════════════════════════════════════════
      case "payment_intent.succeeded": {
        const intent = event.data.object as Stripe.PaymentIntent;
        const reservationId = intent.metadata?.reservationId;
        const type = intent.metadata?.type;

        if (!reservationId) {
          logger.warn("payment_intent.succeeded sans reservationId", {
            route: "/api/stripe/webhooks",
            intentId: intent.id,
            type,
          });
          break;
        }

        // Cas 1 — Capture manuelle d'une caution (dégâts constatés)
        if (isCautionType(type)) {
          await prisma.reservation.update({
            where: { id: Number(reservationId) },
            data: {
              cautionStatus: "CAPTURED",
              cautionIntentId: intent.id,
            },
          });
          logger.info("Stripe webhook: caution captured", {
            reservationId,
            intentId: intent.id,
          });
          break;
        }

        // Cas 2 — Paiement du séjour (deposit / balance / stay-payment)
        const paymentStatus = mapPaymentType(type);
        if (!paymentStatus) {
          logger.warn(
            "payment_intent.succeeded avec metadata.type inconnu — paymentStatus non mis à jour",
            {
              route: "/api/stripe/webhooks",
              type,
              intentId: intent.id,
              reservationId,
            },
          );
          break;
        }

        const reservation = await prisma.reservation.update({
          where: { id: Number(reservationId) },
          data: {
            paymentStatus,
            stripePaymentIntentId: intent.id,
            status: "CONFIRMED",
          },
        });

        await sendPaymentEmail(reservation.id, type ?? "stay-payment");
        break;
      }

      // ════════════════════════════════════════════════════════════════
      // CAUTION AUTORISÉE
      // Stripe envoie cet event dès que la pré-autorisation est validée
      // côté client (3DS OK). On marque la caution comme "HELD".
      // ════════════════════════════════════════════════════════════════
      case "payment_intent.amount_capturable_updated": {
        const intent = event.data.object as Stripe.PaymentIntent;
        const reservationId = intent.metadata?.reservationId;
        const type = intent.metadata?.type;

        if (!reservationId || !isCautionType(type)) break;

        await prisma.reservation.update({
          where: { id: Number(reservationId) },
          data: {
            cautionStatus: "HELD",
            cautionIntentId: intent.id,
          },
        });
        logger.info("Stripe webhook: caution authorized (HELD)", {
          reservationId,
          intentId: intent.id,
        });
        break;
      }

      // ════════════════════════════════════════════════════════════════
      // CAUTION LIBÉRÉE
      // Soit annulation manuelle par l'admin, soit expiration auto
      // (~7 jours pour Stripe). On marque "RELEASED".
      // ════════════════════════════════════════════════════════════════
      case "payment_intent.canceled": {
        const intent = event.data.object as Stripe.PaymentIntent;
        const reservationId = intent.metadata?.reservationId;
        const type = intent.metadata?.type;

        if (!reservationId || !isCautionType(type)) break;

        await prisma.reservation.update({
          where: { id: Number(reservationId) },
          data: { cautionStatus: "RELEASED" },
        });
        logger.info("Stripe webhook: caution released", {
          reservationId,
          intentId: intent.id,
        });
        break;
      }

      // ════════════════════════════════════════════════════════════════
      // PAIEMENT ÉCHOUÉ
      // ════════════════════════════════════════════════════════════════
      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        const reservationId = intent.metadata?.reservationId;
        const type = intent.metadata?.type;

        if (!reservationId) break;

        // Pour la caution : on log mais on ne touche pas à la résa
        if (isCautionType(type)) {
          logger.warn("Stripe webhook: caution authorization failed", {
            reservationId,
            intentId: intent.id,
          });
          break;
        }

        // Pour le séjour : on remet paymentStatus à AWAITING mais on ne
        // touche PAS au status. Si la résa avait été confirmée manuellement
        // par l'admin, on ne veut pas la rebasculer en PENDING.
        await prisma.reservation.update({
          where: { id: Number(reservationId) },
          data: {
            paymentStatus: "AWAITING",
          },
        });

        await sendPaymentFailureEmail(
          Number(reservationId),
          type ?? "deposit",
        );
        break;
      }

      // ════════════════════════════════════════════════════════════════
      // REMBOURSEMENT
      // ════════════════════════════════════════════════════════════════
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id;

        if (!paymentIntentId) break;

        await prisma.reservation.updateMany({
          where: { stripePaymentIntentId: paymentIntentId },
          data: {
            paymentStatus: "REFUNDED",
            status: "CANCELLED",
          },
        });
        break;
      }

      // ════════════════════════════════════════════════════════════════
      // Tous les autres events sont loggés pour debug
      // ════════════════════════════════════════════════════════════════
      default:
        logger.debug("Stripe webhook: unhandled event", {
          route: "/api/stripe/webhooks",
          eventType: event.type,
        });
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("Stripe webhook handling error", {
      route: "/api/stripe/webhooks",
      eventType: event.type,
      error,
    });
    return apiError.serverError("Webhook handling failed");
  }
}

// ─────────────────────────────────────────────────────────────────────
// Helpers email
// ─────────────────────────────────────────────────────────────────────

async function sendPaymentFailureEmail(reservationId: number, type: string) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.CONTACT_EMAIL;
  if (!resendApiKey || !fromEmail) return;

  const resend = new Resend(resendApiKey);

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
  });
  if (!reservation) return;

  const isBalance = type === "balance";
  const subject = isBalance
    ? "Échec du paiement du solde – Villa R.E.E.L"
    : "Échec du paiement de l'acompte – Villa R.E.E.L";

  const retryUrl = isBalance
    ? `${process.env.NEXT_PUBLIC_APP_URL}/reservation/solde/${reservation.confirmationCode}`
    : `${process.env.NEXT_PUBLIC_APP_URL}/reservation/acompte/${reservation.confirmationCode}`;

  const html = `
    <p>Bonjour ${escapeHtml(reservation.guestName)},</p>
    <p>Nous avons rencontré un problème lors du traitement de votre paiement
    (${isBalance ? "solde" : "acompte"}) pour votre réservation à la Villa R.E.E.L.</p>
    <p>Code de confirmation : <strong>${escapeHtml(reservation.confirmationCode)}</strong></p>
    <p>Veuillez réessayer via ce lien sécurisé : <a href="${escapeHtml(retryUrl)}">${escapeHtml(retryUrl)}</a></p>
    <p>Si le problème persiste, n'hésitez pas à nous contacter directement.</p>
    <p>Cordialement,<br/>Villa R.E.E.L</p>
  `;

  await resend.emails.send({
    from: `Villa R.E.E.L <${fromEmail}>`,
    to: [reservation.guestEmail],
    subject,
    html,
  });
}

async function sendPaymentEmail(reservationId: number, type: string) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.CONTACT_EMAIL;
  if (!resendApiKey || !fromEmail) return;

  const resend = new Resend(resendApiKey);

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
  });
  if (!reservation) return;

  // "balance" ou "stay-payment" sont tous deux des paiements intégraux
  const isFullPayment = type === "balance" || type === "stay-payment";
  const subject = isFullPayment
    ? "Solde de votre séjour réglé – Villa R.E.E.L"
    : "Confirmation de votre acompte – Villa R.E.E.L";

  const html = `
    <p>Bonjour ${escapeHtml(reservation.guestName)},</p>
    <p>Nous vous confirmons la bonne réception ${
      isFullPayment
        ? "du règlement intégral de votre séjour"
        : "de votre acompte"
    } pour votre réservation à la Villa R.E.E.L.</p>
    <p>Code de confirmation : <strong>${escapeHtml(reservation.confirmationCode)}</strong></p>
    <p>À très bientôt,</p>
    <p>Villa R.E.E.L</p>
  `;

  await resend.emails.send({
    from: `Villa R.E.E.L <${fromEmail}>`,
    to: [reservation.guestEmail],
    subject,
    html,
  });
}