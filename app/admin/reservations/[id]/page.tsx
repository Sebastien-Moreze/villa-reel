import { prisma } from "@/lib/prisma";
import { requireAuth, isAdmin } from "@/lib/auth";

type PageProps = {
  params: { id: string };
};

export default async function ReservationDetailPage({ params }: PageProps) {
  await requireAuth();
  const admin = await isAdmin();
  if (!admin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-neutral-400">
        Accès refusé.
      </div>
    );
  }

  const id = Number(params.id);
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { villa: true, promoCode: true },
  });

  if (!reservation) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-sm text-neutral-300">
        Réservation introuvable.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-6">
      <h1 className="text-lg font-semibold text-neutral-50">
        Détail réservation
      </h1>
      <p className="mt-1 text-[11px] text-neutral-400">
        Code {reservation.confirmationCode} – {reservation.guestName}
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-[2fr,1.2fr]">
        <section className="space-y-4 rounded-2xl border border-neutral-800 bg-[#050505] p-4 text-[11px] text-neutral-200">
          <h2 className="text-xs font-semibold text-neutral-100">
            Informations voyageur
          </h2>
          <p>
            <span className="text-neutral-400">Nom :</span>{" "}
            <span className="font-semibold">{reservation.guestName}</span>
          </p>
          <p>
            <span className="text-neutral-400">Email :</span>{" "}
            {reservation.guestEmail}
          </p>
          {reservation.guestPhone && (
            <p>
              <span className="text-neutral-400">Téléphone :</span>{" "}
              {reservation.guestPhone}
            </p>
          )}
          {reservation.guestAddress && (
            <p>
              <span className="text-neutral-400">Adresse :</span>{" "}
              {reservation.guestAddress}
            </p>
          )}
          <p>
            <span className="text-neutral-400">Séjour :</span>{" "}
            {reservation.checkIn.toLocaleDateString("fr-FR")} →{" "}
            {reservation.checkOut.toLocaleDateString("fr-FR")} (
            {reservation.nbNights} nuits, {reservation.nbGuests} personnes)
          </p>
          <p>
            <span className="text-neutral-400">Villa :</span>{" "}
            {reservation.villa.nameFr}
          </p>
          {reservation.promoCode && (
            <p>
              <span className="text-neutral-400">Code promo :</span>{" "}
              {reservation.promoCode.code}
            </p>
          )}
        </section>

        <section className="space-y-3 rounded-2xl border border-neutral-800 bg-[#050505] p-4 text-[11px] text-neutral-200">
          <h2 className="text-xs font-semibold text-neutral-100">
            Paiements
          </h2>
          <p>
            <span className="text-neutral-400">Total séjour :</span>{" "}
            {Number(reservation.totalAmount).toLocaleString("fr-FR", {
              style: "currency",
              currency: "EUR",
            })}
          </p>
          <p>
            <span className="text-neutral-400">Acompte :</span>{" "}
            {Number(reservation.depositAmount ?? 0).toLocaleString("fr-FR", {
              style: "currency",
              currency: "EUR",
            })}
          </p>
          <p>
            <span className="text-neutral-400">Solde :</span>{" "}
            {Number(reservation.balanceAmount ?? 0).toLocaleString("fr-FR", {
              style: "currency",
              currency: "EUR",
            })}
          </p>
          <p>
            <span className="text-neutral-400">Statut paiement :</span>{" "}
            {reservation.paymentStatus}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-full border border-neutral-700 px-3 py-1 text-[11px] text-neutral-200 hover:border-primary"
            >
              Marquer payé
            </button>
            <button
              type="button"
              className="rounded-full border border-neutral-700 px-3 py-1 text-[11px] text-neutral-200 hover:border-cta"
            >
              Rembourser
            </button>
            <button
              type="button"
              className="rounded-full border border-neutral-700 px-3 py-1 text-[11px] text-neutral-200 hover:border-primary"
            >
              Envoyer rappel
            </button>
          </div>
        </section>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-neutral-800 bg-[#050505] p-4 text-[11px] text-neutral-200">
          <h2 className="text-xs font-semibold text-neutral-100">
            Timeline des paiements
          </h2>
          <p className="mt-2 text-neutral-500">
            Historique détaillé à implémenter (journal des PaymentIntents,
            captures et remboursements).
          </p>
        </section>
        <section className="rounded-2xl border border-neutral-800 bg-[#050505] p-4 text-[11px] text-neutral-200">
          <h2 className="text-xs font-semibold text-neutral-100">
            Historique des emails
          </h2>
          <p className="mt-2 text-neutral-500">
            À connecter avec votre système d&apos;emails (confirmation,
            rappels, arrivée, avis...).
          </p>
        </section>
      </div>
    </div>
  );
}

