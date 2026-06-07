'use client';

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise =
  typeof window !== "undefined"
    ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK ?? "")
    : null;

type InitData = {
  clientSecret: string;
  cautionAmount: number;
  guestName: string;
  confirmationCode: string;
  villaName: string;
  alreadyDone?: boolean;
};

// ── Formulaire Stripe ────────────────────────────────────────────────────────

function CautionForm({ data, token }: { data: InitData; token: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    const card = elements.getElement(CardElement);
    if (!card) { setLoading(false); return; }

    const result = await stripe.confirmCardPayment(data.clientSecret, {
      payment_method: { card },
    });

    if (result.error) {
      setError(result.error.message ?? "Une erreur est survenue.");
      setLoading(false);
      return;
    }

    if (result.paymentIntent?.status === "requires_capture") {
      // Notifier le backend → cautionStatus = HELD
      await fetch("/api/stripe/confirm-caution-held", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      }).catch(() => {});
      setDone(true);
    } else {
      setError("Statut inattendu. Veuillez réessayer ou nous contacter.");
    }
    setLoading(false);
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <div className="text-4xl mb-3">✅</div>
        <p className="font-semibold text-emerald-800 text-base">Caution autorisée avec succès</p>
        <p className="text-sm text-emerald-700 mt-2">
          Votre empreinte bancaire de <strong>{data.cautionAmount.toLocaleString("fr-FR")} €</strong> a bien été enregistrée.
          Elle sera libérée après votre départ si tout est en ordre.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <p className="font-semibold mb-1">ℹ️ Empreinte bancaire uniquement</p>
        <p>
          Cette opération <strong>ne débite pas</strong> votre carte.
          Le montant de <strong>{data.cautionAmount.toLocaleString("fr-FR")} €</strong> est
          simplement bloqué et sera libéré après votre départ si aucun dommage n'est constaté.
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
          Numéro de carte
        </label>
        <div className="rounded-lg border border-neutral-300 bg-white p-3 shadow-sm">
          <CardElement options={{ style: { base: { fontSize: "14px", color: "#111827" } } }} />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
          <p className="text-xs font-semibold text-red-700">⚠ {error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full rounded-full bg-[#2d6a4f] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading
          ? "Autorisation en cours..."
          : `Autoriser la caution de ${data.cautionAmount.toLocaleString("fr-FR")} €`}
      </button>

      <p className="text-center text-[10px] text-neutral-400">
        Paiement 100 % sécurisé via Stripe. Vos données bancaires ne sont jamais stockées sur nos serveurs.
      </p>
    </form>
  );
}

// ── Page principale ──────────────────────────────────────────────────────────

export default function CautionClientPage({ token, locale }: { token: string; locale: string }) {
  const [initData, setInitData] = useState<InitData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/caution/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((data: InitData & { error?: string }) => {
        if (data.error) { setLoadError(data.error); return; }
        setInitData(data);
      })
      .catch(() => setLoadError("Impossible de charger la page. Veuillez réessayer."));
  }, [token]);

  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <p className="text-xl font-bold tracking-tight text-[#2d6a4f]">Villa R.E.E.L</p>
          <p className="text-sm text-neutral-500 mt-1">Autorisation de caution</p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-5">
          {!initData && !loadError && (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-neutral-500">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#2d6a4f] border-t-transparent" />
              Chargement...
            </div>
          )}

          {loadError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <p className="font-semibold mb-1">⚠ Lien invalide ou expiré</p>
              <p>{loadError}</p>
              <p className="mt-3 text-xs">Contactez-nous si vous pensez que c'est une erreur.</p>
            </div>
          )}

          {initData?.alreadyDone && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <p className="font-semibold">✅ Déjà enregistrée</p>
              <p className="mt-1">La caution pour cette réservation a déjà été autorisée. Merci !</p>
            </div>
          )}

          {initData && !initData.alreadyDone && (
            <>
              {/* Récap réservation */}
              <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-4 text-sm space-y-1">
                <p className="text-xs text-neutral-500">Réservation</p>
                <p className="font-semibold text-neutral-800">{initData.confirmationCode}</p>
                <p className="text-neutral-600">{initData.villaName}</p>
                <p className="text-neutral-500 text-xs">Bonjour, {initData.guestName}</p>
              </div>

              {stripePromise && (
                <Elements stripe={stripePromise} options={{ clientSecret: initData.clientSecret }}>
                  <CautionForm data={initData} token={token} />
                </Elements>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
