import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

export const config = {
  api: {
    bodyParser: false,
  },
};

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
    apiVersion: "2024-06-20",
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
  } catch (err: any) {
    console.error("Stripe webhook signature error", err.message);
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
        if (!reservationId) break;

        await prisma.reservation.update({
          where: { id: Number(reservationId) },
          data: {
            paymentStatus: "AWAITING",
            status: "PENDING",
          },
        });
        // TODO: envoyer un email d'échec de paiement
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
    <p>Bonjour ${reservation.guestName},</p>
    <p>Nous vous confirmons la bonne réception ${
      type === "deposit" ? "de votre acompte" : "du solde de votre séjour"
    } pour votre réservation à la Villa R.E.E.L.</p>
    <p>Code de confirmation : <strong>${reservation.confirmationCode}</strong></p>
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

