import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { escapeHtml } from "@/lib/html";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_SK;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook not configured" },
      { status: 500 },
    );
  }

  const stripe = new Stripe(secret, {
    apiVersion: "2026-02-25.clover",
  });

  const sig = request.headers.get("stripe-signature");
  const rawBody = Buffer.from(await request.arrayBuffer());

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig ?? "",
      webhookSecret,
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown Stripe webhook error";
    console.error("Stripe webhook signature error", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object as Stripe.PaymentIntent;
        const reservationId = intent.metadata?.reservationId;
        const type = intent.metadata?.type;
        if (!reservationId || !type) break;

        const reservation = await prisma.reservation.update({
          where: { id: Number(reservationId) },
          data: {
            paymentStatus:
              type === "deposit"
                ? "DEPOSIT_PAID"
                : type === "balance"
                ? "FULLY_PAID"
                : undefined,
            stripePaymentIntentId: intent.id,
            status: "CONFIRMED",
          },
        });

        await sendPaymentEmail(reservation.id, type);
        break;
      }
      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        const reservationId = intent.metadata?.reservationId;
        const type = intent.metadata?.type;
        if (!reservationId) break;

        await prisma.reservation.update({
          where: { id: Number(reservationId) },
          data: {
            paymentStatus: "AWAITING",
            status: "PENDING",
          },
        });

        await sendPaymentFailureEmail(Number(reservationId), type ?? "deposit");
        break;
      }
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
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook handling error", error);
    return NextResponse.json(
      { error: "Webhook handling failed" },
      { status: 500 },
    );
  }
}

async function sendPaymentFailureEmail(reservationId: number, type: string) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.CONTACT_EMAIL;
  if (!resendApiKey || !fromEmail) return;

  const resend = new Resend(resendApiKey);
  const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } });
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

  const subject =
    type === "deposit"
      ? "Confirmation de votre acompte – Villa R.E.E.L"
      : "Solde de votre séjour réglé – Villa R.E.E.L";

  const html = `
    <p>Bonjour ${escapeHtml(reservation.guestName)},</p>
    <p>Nous vous confirmons la bonne réception ${
      type === "deposit" ? "de votre acompte" : "du solde de votre séjour"
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

