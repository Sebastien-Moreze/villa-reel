'use client';

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

type Props = {
  reservationId: number;
  totalAmount: number;
  confirmationCode: string;
  onPaid: () => void;
};

const stripePromise =
  typeof window !== "undefined"
    ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK ?? "")
    : null;

function PaymentForm({ reservationId, totalAmount, onPaid }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"idle" | "charging" | "caution">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      // ── Étape 1 : récupérer les deux client_secrets ───────────────────
      const res = await fetch("/api/stripe/create-deposit-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationId }),
      });

      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        setError(err.error ?? "Impossible de créer le paiement. Veuillez réessayer.");
        setLoading(false);
        return;
      }

      const {
        clientSecret,
        cautionClientSecret,
        cautionAmount,
      } = (await res.json()) as {
        clientSecret?: string;
        cautionClientSecret?: string | null;
        cautionAmount?: number;
      };

      if (!clientSecret) {
        setError("Erreur de configuration du paiement.");
        setLoading(false);
        return;
      }

      const card = elements.getElement(CardElement);
      if (!card) {
        setError("Aucune carte détectée.");
        setLoading(false);
        return;
      }

      // ── Étape 2 : paiement du séjour (débit immédiat) ─────────────────
      setStep("charging");
      const mainResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      });

      if (mainResult.error) {
        setError(mainResult.error.message ?? "Le paiement a échoué.");
        setLoading(false);
        setStep("idle");
        return;
      }

      if (mainResult.paymentIntent?.status !== "succeeded") {
        setError("Le paiement n'a pas pu être confirmé. Veuillez réessayer.");
        setLoading(false);
        setStep("idle");
        return;
      }

      // ── Étape 3 : autorisation de la caution (non débité) ────────────
      if (cautionClientSecret && cautionAmount && cautionAmount > 0) {
        setStep("caution");
        const pmId = mainResult.paymentIntent.payment_method as string;

        const cautionResult = await stripe.confirmCardPayment(cautionClientSecret, {
          payment_method: pmId,   // même moyen de paiement — pas de ressaisie carte
        });

        if (cautionResult.error) {
          // L'autorisation caution a échoué mais le séjour est payé — on laisse passer
          // L'admin verra cautionStatus = NONE et devra gérer manuellement
          console.warn("Caution hold failed:", cautionResult.error.message);
        }

        // Notifier le backend que la caution est en attente de capture
        if (cautionResult.paymentIntent?.status === "requires_capture") {
          await fetch("/api/stripe/confirm-caution-held", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reservationId }),
          }).catch(() => { /* non bloquant */ });
        }
      }

      onPaid();
    } catch {
      setError("Une erreur est survenue pendant le paiement.");
      setLoading(false);
      setStep("idle");
    }
  };

  const stepLabel = step === "charging"
    ? "Paiement du séjour en cours..."
    : step === "caution"
    ? "Autorisation de la caution en cours..."
    : `Payer ${totalAmount.toLocaleString("fr-FR")} €`;

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-xs text-neutral-800">
      <div>
        <p className="text-sm font-semibold text-neutral-900">Paiement sécurisé</p>
        <p className="mt-1 text-[11px] text-neutral-500">
          Deux opérations vont être effectuées sur votre carte :
        </p>
      </div>

      {/* Résumé des 2 opérations */}
      <div className="space-y-2">
        <div className="flex items-start gap-3 rounded-lg border border-neutral-100 bg-white p-3">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white mt-0.5">1</div>
          <div>
            <p className="text-[11px] font-semibold text-neutral-800">Paiement du séjour</p>
            <p className="text-[10px] text-neutral-500">
              {totalAmount.toLocaleString("fr-FR")} € — débit immédiat
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-lg border border-neutral-100 bg-white p-3">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white mt-0.5">2</div>
          <div>
            <p className="text-[11px] font-semibold text-neutral-800">Caution (non débitée)</p>
            <p className="text-[10px] text-neutral-500">
              500 € — empreinte bancaire uniquement. Libérée ou encaissée par le propriétaire dans les 48h suivant votre départ.
            </p>
          </div>
        </div>
      </div>

      {/* Champ carte */}
      <div className="flex items-center gap-2 text-[10px] text-neutral-500">
        <span>Cartes acceptées :</span>
        <span className="rounded-full bg-neutral-200 px-2 py-0.5">Visa</span>
        <span className="rounded-full bg-neutral-200 px-2 py-0.5">Mastercard</span>
        <span className="rounded-full bg-neutral-200 px-2 py-0.5">Amex</span>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-3">
        <CardElement
          options={{
            style: {
              base: { fontSize: "14px", color: "#111827" },
            },
          }}
        />
      </div>

      {/* Barre de progression pendant le paiement */}
      {loading && (
        <div className="rounded-lg bg-neutral-50 border border-neutral-100 p-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-[11px] font-medium text-neutral-700">{stepLabel}</p>
          </div>
          {step === "caution" && (
            <p className="mt-1.5 text-[10px] text-neutral-500 ml-5">
              Autorisation de la caution en cours — ne fermez pas la page.
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
          <p className="text-[11px] font-semibold text-red-700">⚠ {error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? stepLabel : `Payer ${totalAmount.toLocaleString("fr-FR")} € + caution 500 €`}
      </button>

      <p className="text-[10px] text-neutral-400 text-center leading-relaxed">
        Paiement 100 % sécurisé via Stripe. Vos données bancaires ne sont jamais
        stockées sur nos serveurs.
      </p>
    </form>
  );
}

export function ReservationStep4({ reservationId, totalAmount, confirmationCode, onPaid }: Props) {
  if (!stripePromise) {
    return (
      <p className="text-xs text-neutral-600">
        Initialisation du module de paiement sécurisé...
      </p>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm
        reservationId={reservationId}
        totalAmount={totalAmount}
        confirmationCode={confirmationCode}
        onPaid={onPaid}
      />
    </Elements>
  );
}
