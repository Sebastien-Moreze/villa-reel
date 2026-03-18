import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    reservationId?: number;
    villaId?: number;
    type?: "deposit" | "balance";
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
    apiVersion: "2026-02-25.clover",
  });

  const { reservationId, villaId, type = "deposit" } = body;

  if (!reservationId || !villaId) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // ── Validation côté serveur ───────────────────────────────────────────────
  // Le montant n'est JAMAIS fourni par le client — il est toujours lu en DB.
  // Cela empêche toute manipulation de prix côté navigateur.
  const reservation = await prisma.reservation.findUnique({
    where: { id: Number(reservationId) },
    select: {
      id: true,
      villaId: true,
      depositAmount: true,
      balanceAmount: true,
      status: true,
      paymentStatus: true,
    },
  });

  if (!reservation) {
    return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
  }

  // Vérifier que la villa correspond
  if (reservation.villaId !== Number(villaId)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Vérifier l'état de la réservation
  if (reservation.status === "CANCELLED") {
    return NextResponse.json({ error: "Reservation is cancelled" }, { status: 400 });
  }

  // Calculer le montant depuis la DB (en centimes)
  const serverAmount =
    type === "balance"
      ? Math.round(Number(reservation.balanceAmount) * 100)
      : Math.round(Number(reservation.depositAmount) * 100);

  if (!serverAmount || serverAmount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const currency = body.currency ?? "eur";

  try {
    const intent = await stripe.paymentIntents.create({
      amount: serverAmount,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        reservationId: String(reservationId),
        villaId: String(villaId),
        type,
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
