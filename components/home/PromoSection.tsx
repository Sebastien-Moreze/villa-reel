type PromoSectionProps = {
  code: string;
  description?: string | null;
};

export function PromoSection({ code, description }: PromoSectionProps) {
  return (
    <section className="bg-neutral-900 py-12 text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
            Offre spéciale
          </p>
          <h2 className="font-display mt-2 text-2xl font-semibold text-white md:text-3xl">
            Code promo&nbsp;
            <span className="rounded-full bg-cta/20 px-3 py-1 text-base font-bold tracking-[0.25em] text-cta">
              {code}
            </span>
          </h2>
          {description && (
            <p className="mt-2 max-w-xl text-xs text-neutral-300">
              {description}
            </p>
          )}
        </div>
        <p className="text-[11px] text-neutral-400">
          Offre valable sur une sélection de dates. Saisissez le code lors de votre
          réservation pour en profiter.
        </p>
      </div>
    </section>
  );
}

