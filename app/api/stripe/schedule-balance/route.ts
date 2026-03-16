import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export async function POST() {
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

  const today = new Date();
  const target = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 30,
  );

  const reservations = await prisma.reservation.findMany({
    where: {
      checkIn: {
        gte: new Date(
          target.getFullYear(),
          target.getMonth(),
          target.getDate(),
        ),
        lt: new Date(
          target.getFullYear(),
          target.getMonth(),
          target.getDate() + 1,
        ),
      },
      paymentStatus: "DEPOSIT_PAID",
    },
  });

  for (const reservation of reservations) {
    const balanceAmount = reservation.balanceAmount ?? 0;
    if (balanceAmount <= 0) continue;

    try {
      await stripe.paymentIntents.create({
        amount: Math.round(Number(balanceAmount) * 100),
        currency: "eur",
        automatic_payment_methods: { enabled: true },
        metadata: {
          reservationId: String(reservation.id),
          villaId: String(reservation.villaId),
          type: "balance",
        },
      });
    } catch (error) {
      console.error("Failed to create balance payment intent", error);
    }
  }

  return NextResponse.json({ scheduled: reservations.length });
}

