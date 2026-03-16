'use client';

type Props = {
  confirmationCode: string;
  summary: {
    checkIn: string | null;
    checkOut: string | null;
    nights: number;
    guests: number;
    total: number;
  };
};

export function ReservationStep5({ confirmationCode, summary }: Props) {
  return (
    <div className="space-y-5 text-xs text-neutral-800">
      <div className="flex flex-col items-center text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <div className="h-7 w-7 rounded-full border-2 border-primary bg-primary text-white">
            <div className="flex h-full w-full items-center justify-center text-lg">
              ✓
            </div>
          </div>
        </div>
        <p className="text-sm font-semibold text-neutral-900">
          Votre réservation est confirmée
        </p>
        <p className="mt-1 text-[11px] text-neutral-600">
          Un email de confirmation vient de vous être envoyé avec le détail de
          votre séjour.
        </p>
      </div>

      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-[11px]">
        <p className="text-neutral-600">Code de confirmation</p>
        <p className="mt-1 text-lg font-semibold tracking-[0.2em] text-primary">
          {confirmationCode}
        </p>
      </div>

      <div className="rounded-2xl bg-white p-4 text-[11px] text-neutral-700 shadow-sm">
        <p className="font-semibold text-neutral-900">
          Récapitulatif de votre séjour
        </p>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          <div>
            <p className="text-neutral-500">Arrivée</p>
            <p className="font-semibold">
              {summary.checkIn ?? "Non précisée"}
            </p>
          </div>
          <div>
            <p className="text-neutral-500">Départ</p>
            <p className="font-semibold">
              {summary.checkOut ?? "Non précisée"}
            </p>
          </div>
          <div>
            <p className="text-neutral-500">Nombre de nuits</p>
            <p className="font-semibold">{summary.nights}</p>
          </div>
          <div>
            <p className="text-neutral-500">Nombre de personnes</p>
            <p className="font-semibold">{summary.guests}</p>
          </div>
        </div>
        <div className="mt-3 border-t border-neutral-200 pt-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-neutral-900">
              Total du séjour
            </span>
            <span className="text-base font-semibold text-neutral-900">
              {summary.total} €
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-4 py-2 text-[11px] font-semibold text-neutral-800 shadow-sm hover:border-primary hover:text-primary"
        >
          Télécharger la confirmation
        </button>
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-[11px] font-semibold text-white shadow-md hover:opacity-90"
        >
          Retour à l&apos;accueil
        </a>
      </div>
    </div>
  );
}

