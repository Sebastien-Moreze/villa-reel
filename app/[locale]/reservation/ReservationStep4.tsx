'use client';

import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

type Props = {
  depositAmount: number;
  onPaid: (confirmationCode: string) => void;
};

const stripePromise =
  typeof window !== "undefined"
    ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK ?? "")
    : null;

function PaymentForm({ depositAmount, onPaid }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/create-deposit-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: depositAmount * 100, currency: "eur" }),
      });
      if (!res.ok) {
        setError("Impossible de créer le paiement. Veuillez réessayer.");
        setLoading(false);
        return;
      }
      const data = (await res.json()) as { clientSecret?: string };
      if (!data.clientSecret) {
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

      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card,
        },
      });

      if (result.error) {
        setError(result.error.message ?? "Le paiement a échoué.");
        setLoading(false);
        return;
      }

      if (result.paymentIntent && result.paymentIntent.status === "succeeded") {
        const code = result.paymentIntent.id;
        onPaid(code);
      }
    } catch (err) {
      setError("Une erreur est survenue pendant le paiement.");
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 text-xs text-neutral-800"
    >
      <p className="text-sm font-semibold text-neutral-900">
        Paiement sécurisé de l&apos;acompte
      </p>
      <p className="text-[11px] text-neutral-600">
        Montant de l&apos;acompte à régler maintenant :{" "}
        <span className="font-semibold text-neutral-900">
          {depositAmount} €
        </span>
      </p>

      <div className="flex items-center gap-2 text-[10px] text-neutral-500">
        <span>Cartes acceptées :</span>
        <span className="rounded-full bg-neutral-200 px-2 py-0.5">Visa</span>
        <span className="rounded-full bg-neutral-200 px-2 py-0.5">
          Mastercard
        </span>
        <span className="rounded-full bg-neutral-200 px-2 py-0.5">Amex</span>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-3">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "14px",
                color: "#111827",
              },
            },
          }}
        />
      </div>

      {error && (
        <p className="text-[11px] font-semibold text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Paiement en cours..." : "Payer l'acompte"}
      </button>

      <p className="text-[10px] text-neutral-500">
        Le solde restant sera à régler avant votre arrivée, selon les conditions
        précisées dans les CGV.
      </p>
    </form>
  );
}

export function ReservationStep4({ depositAmount, onPaid }: Props) {
  if (!stripePromise) {
    return (
      <p className="text-xs text-neutral-600">
        Initialisation du module de paiement sécurisé...
      </p>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm depositAmount={depositAmount} onPaid={onPaid} />
    </Elements>
  );
}

