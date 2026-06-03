import { redirect, notFound } from "next/navigation";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ confirmationCode: string; locale: string }>;
};

/**
 * Page de redirection vers Stripe Checkout pour le paiement du solde.
 *
 * Le lien envoyé par email pointe ici — il est permanent (côté villareel.com).
 * À chaque visite, une nouvelle session Stripe est créée à la volée et le
 * client est redirigé immédiatement vers checkout.stripe.com.
 *
 * Aucune session n'est stockée à l'avance : plus de problème d'expiration.
 */
export default async function PaiementSoldePage({ params }: Props) {
  const { confirmationCode, locale } = await params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://villareel.com";

  const reservation = await prisma.reservation.findUnique({
    where: { confirmationCode },
    select: {
      id: true,
      villaId: true,
      confirmationCode: true,
      guestEmail: true,
      checkIn: true,
      balanceAmount: true,
      totalAmount: true,
      paymentStatus: true,
      status: true,
    },
  });

  // Réservation introuvable
  if (!reservation) notFound();

  // Déjà payé → page de confirmation
  if (reservation.paymentStatus === "FULLY_PAID") {
    redirect(`/${locale}/reservation/merci?code=${confirmationCode}&already=1`);
  }

  // Après le check-in → trop tard
  if (new Date() > reservation.checkIn) {
    redirect(`/${locale}`);
  }

  const balanceAmount = Number(
    reservation.balanceAmount ?? reservation.totalAmount ?? 0,
  );

  if (balanceAmount <= 0) {
    redirect(`/${locale}`);
  }

  // Crée une session Stripe fraîche (23h max imposé par Stripe)
  const stripe = new Stripe(process.env.STRIPE_SK!, {
    apiVersion: "2026-02-25.clover",
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: reservation.guestEmail,
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: `Solde séjour Villa R.E.E.L – ${confirmationCode}`,
          },
          unit_amount: Math.round(balanceAmount * 100),
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      metadata: {
        reservationId: String(reservation.id),
        villaId: String(reservation.villaId),
        type: "balance",
      },
    },
    success_url: `${appUrl}/${locale}/reservation/merci?code=${confirmationCode}`,
    cancel_url: `${appUrl}/${locale}/reservation/paiement-solde/${confirmationCode}`,
    expires_at: Math.floor(Date.now() / 1000) + 23 * 60 * 60,
  });

  if (!session.url) redirect(`/${locale}`);

  redirect(session.url);
}
