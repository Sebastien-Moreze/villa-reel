type PageProps = {
  params: { locale: string };
};

export default function EntreprisesPage({ params }: PageProps) {
  const { locale } = params;

  return (
    <div className="pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-950 via-neutral-900 to-primary/90 py-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 md:flex-row md:items-center md:px-6">
          <div className="flex-1 space-y-3 text-white">
            <p className="text-xs uppercase tracking-[0.3em] text-secondary">
              Villa R.E.E.L
            </p>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Entreprises &amp; Séminaires
            </h1>
            <p className="max-w-xl text-sm text-neutral-200">
              Offrez à vos équipes un cadre inspirant entre Alpes et jardin
              tropical pour séminaires, ateliers, lancements de produits et
              moments de cohésion.
            </p>
          </div>
        </div>

        {/* Stats band */}
        <div className="mt-10 border-t border-neutral-800/80 bg-black/40">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-6 text-xs text-neutral-200 md:grid-cols-4 md:px-6">
            <StatItem label="Capacité" value="Jusqu'à 20 personnes" />
            <StatItem label="Surface totale" value="250 m²" />
            <StatItem label="Chambres" value="4 chambres double" />
            <StatItem label="Piscine" value="Piscine chauffée" />
          </div>
        </div>
      </section>

      {/* Formules */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Formules entreprises
          </h2>
          <p className="mt-2 text-center text-xl font-semibold text-neutral-900 md:text-2xl">
            Imaginez vos temps forts professionnels à la Villa R.E.E.L
          </p>

          <div className="mt-8 grid gap-4 text-sm text-neutral-800 md:grid-cols-3">
            {[
              "Séminaires",
              "Team Building",
              "Incentive",
              "Formations",
              "Soirées professionnelles",
              "Lancements de produits",
            ].map((title) => (
              <article
                key={title}
                className="flex h-full flex-col rounded-2xl border border-primary/10 bg-primary/5 p-4 shadow-sm"
              >
                <h3 className="text-sm font-semibold text-neutral-900">
                  {title}
                </h3>
                <p className="mt-2 text-xs text-neutral-600">
                  Un cadre chaleureux pour des sessions de travail, des ateliers
                  créatifs ou des présentations inspirantes, avec des espaces
                  intérieurs et extérieurs modulables.
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Pourquoi choisir la villa */}
      <section className="bg-[#f6f7f8] py-14">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Pourquoi choisir la Villa
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
              <div className="h-32 rounded-xl bg-gradient-to-br from-primary to-secondary" />
              <h3 className="text-sm font-semibold text-neutral-900">
                Un cocon hors du bureau
              </h3>
              <p className="text-xs text-neutral-600">
                Loin des salles anonymes, une maison de caractère qui favorise
                l&apos;échange informel, la créativité et la cohésion.
              </p>
            </div>
            <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
              <div className="h-32 rounded-xl bg-gradient-to-br from-primary/80 to-slate-900" />
              <h3 className="text-sm font-semibold text-neutral-900">
                Espaces intérieurs &amp; extérieurs
              </h3>
              <p className="text-xs text-neutral-600">
                Salon, terrasse, jardin tropical et piscine deviennent tour à
                tour scène de travail, de partage ou de détente.
              </p>
            </div>
            <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
              <div className="h-32 rounded-xl bg-gradient-to-br from-secondary to-primary/60" />
              <h3 className="text-sm font-semibold text-neutral-900">
                Partenaires sur-mesure
              </h3>
              <p className="text-xs text-neutral-600">
                Services traiteur, œnologie, photographie et accompagnement
                événementiel peuvent être ajoutés selon vos besoins.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA devis */}
      <section className="bg-neutral-950 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center text-sm text-neutral-100 md:flex-row md:text-left md:px-6">
          <div>
            <h2 className="text-base font-semibold text-white">
              Envisagez votre prochain séminaire à la Villa R.E.E.L
            </h2>
            <p className="mt-1 text-xs text-neutral-400">
              Partagez votre projet, vos dates et vos besoins, nous revenons
              vers vous avec une proposition sur-mesure.
            </p>
          </div>
          <a
            href={`/${locale}/contact`}
            className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-xs font-semibold text-neutral-900 shadow-md transition hover:bg-neutral-100"
          >
            Demander un devis
          </a>
        </div>
      </section>
    </div>
  );
}

type StatItemProps = {
  label: string;
  value: string;
};

function StatItem({ label, value }: StatItemProps) {
  return (
    <div className="space-y-1">
      <div className="text-[11px] uppercase tracking-wide text-neutral-400">
        {label}
      </div>
      <div className="text-xs font-semibold text-neutral-50">{value}</div>
    </div>
  );
}

