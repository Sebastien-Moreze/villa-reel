import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // ── Rate limiting : 5 tentatives par IP par minute ───────────────────────
  const ip = getClientIp(request);
  if (!rateLimit(`deposit-intent:${ip}`, 5, 60_000)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const body = (await request.json()) as {
    reservationId?: number;
    currency?: string;
  };

  const secret = process.env.STRIPE_SK;
  if (!secret) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 },
    );
  }

  const { reservationId } = body;
  if (!reservationId) {
    return NextResponse.json({ error: "reservationId is required" }, { status: 400 });
  }

  // ── Le montant est toujours lu en DB, jamais fourni par le client ─────────
  const reservation = await prisma.reservation.findUnique({
    where: { id: Number(reservationId) },
    select: {
      id: true,
      depositAmount: true,
      status: true,
      paymentStatus: true,
      villaId: true,
    },
  });

  if (!reservation) {
    return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
  }

  if (reservation.status === "CANCELLED") {
    return NextResponse.json({ error: "Reservation is cancelled" }, { status: 400 });
  }

  if (reservation.paymentStatus === "DEPOSIT_PAID" || reservation.paymentStatus === "FULLY_PAID") {
    return NextResponse.json({ error: "Deposit already paid" }, { status: 400 });
  }

  const serverAmount = Math.round(Number(reservation.depositAmount) * 100);
  if (!serverAmount || serverAmount <= 0) {
    return NextResponse.json({ error: "Invalid deposit amount" }, { status: 400 });
  }

  const stripe = new Stripe(secret, {
    apiVersion: "2026-02-25.clover",
  });

  const currency = body.currency ?? "eur";

  try {
    const intent = await stripe.paymentIntents.create({
      amount: serverAmount,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        reservationId: String(reservation.id),
        villaId: String(reservation.villaId),
        type: "deposit",
        purpose: "villa-reel-deposit",
      },
    });

    return NextResponse.json({ clientSecret: intent.client_secret });
  } catch (error) {
    console.error("Stripe error", error);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 },
    );
  }
}
