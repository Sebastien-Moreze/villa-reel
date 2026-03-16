import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    reservationId?: number;
    villaId?: number;
    amount?: number; // in cents
    currency?: string;
  };

  const secret = process.env.STRIPE_SK;
  if (!secret) {
    return NextResponse.json(
      { error: "Stripe secret key not configured" },
      { status: 500 },
    );
  }

  const stripe = new Stripe(secret, {
    apiVersion: "2024-06-20",
  });

  const amount = body.amount;
  if (!amount || amount <= 0 || !body.reservationId || !body.villaId) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const currency = body.currency ?? "eur";

  try {
    const intent = await stripe.paymentIntents.create({
      amount,
      currency,
      capture_method: "manual",
      automatic_payment_methods: { enabled: true },
      metadata: {
        reservationId: String(body.reservationId),
        villaId: String(body.villaId),
        type: "deposit-hold",
      },
    });

    return NextResponse.json({ clientSecret: intent.client_secret });
  } catch (error) {
    console.error("Stripe error", error);
    return NextResponse.json(
      { error: "Failed to create deposit hold" },
      { status: 500 },
    );
  }
}

