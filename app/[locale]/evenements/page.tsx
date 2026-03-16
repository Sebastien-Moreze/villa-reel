type PageProps = {
  params: { locale: string };
};

export default function EvenementsPage({ params }: PageProps) {
  const { locale } = params;

  const events = [
    {
      title: "Fiançailles",
      color: "from-violet-700 to-fuchsia-700",
      description:
        "Un écrin intime pour célébrer vos fiançailles entourés de vos proches, entre salon chaleureux et terrasse végétalisée.",
    },
    {
      title: "Mariages",
      color: "from-primary to-secondary",
      description:
        "Une maison de caractère pour un mariage confidentiel, où chaque espace peut être mis en scène pour votre journée.",
    },
    {
      title: "Anniversaires",
      color: "from-cta/90 to-cta",
      description:
        "Un anniversaire inoubliable dans une villa chaleureuse, avec piscine, jardin tropical et ambiance lumineuse travaillée.",
    },
    {
      title: "EVJF / EVG",
      color: "from-slate-900 to-indigo-800",
      description:
        "Un cadre chic et décontracté pour un week-end entre amis, entre détente, jeux, et soirées au bord de la piscine.",
    },
  ];

  return (
    <div className="pb-16">
      {/* Hero */}
      <section className="bg-gradient-to-b from-violet-950 via-fuchsia-900 to-neutral-950 py-20 text-white">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-fuchsia-200">
            Villa R.E.E.L
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            Événements &amp; célébrations
          </h1>
          <p className="mt-3 max-w-xl text-sm text-fuchsia-100/90">
            Fiançailles, mariages intimistes, anniversaires, EVJF/EVG... La
            Villa R.E.E.L devient le décor de vos moments les plus précieux.
          </p>
        </div>
      </section>

      {/* Event cards */}
      <section className="bg-neutral-950 py-12">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-5 md:grid-cols-2">
            {events.map((event) => (
              <article
                key={event.title}
                className="overflow-hidden rounded-2xl border border-white/5 bg-neutral-900/60 shadow-lg"
              >
                <div
                  className={`h-2 bg-gradient-to-r ${event.color}`}
                />
                <div className="p-5 text-sm text-neutral-100">
                  <h2 className="text-base font-semibold">{event.title}</h2>
                  <p className="mt-2 text-xs text-neutral-300">
                    {event.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Services inclus */}
      <section className="bg-[#f6f3ff] py-14">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-800">
            Services & partenaires
          </h2>
          <p className="mt-2 max-w-xl text-sm text-neutral-800">
            Composez votre événement avec nos partenaires de confiance, selon
            vos envies et votre budget.
          </p>

          <div className="mt-8 grid gap-4 text-xs text-neutral-800 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-neutral-900">
                Chef à domicile
              </h3>
              <p className="mt-2 text-neutral-600">
                Menus sur-mesure, accords mets &amp; vins, brunchs, cocktails
                dînatoires...
              </p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-neutral-900">
                Œnologie avec ViniLux
              </h3>
              <p className="mt-2 text-neutral-600">
                Sélections de vins, ateliers dégustation et accords autour de
                vos repas.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-neutral-900">
                Décoration &amp; scénographie
              </h3>
              <p className="mt-2 text-neutral-600">
                Ambiance florale, mise en lumière, décoration de table et
                scénographie globale.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-neutral-900">
                Photographie &amp; vidéo
              </h3>
              <p className="mt-2 text-neutral-600">
                Capture professionnelle de votre événement pour des souvenirs
                durables.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-neutral-900">
                Musique &amp; ambiance
              </h3>
              <p className="mt-2 text-neutral-600">
                DJs, musiciens live, playlists et sonorisation adaptée à vos
                envies.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-neutral-900">
                Coordination événementielle
              </h3>
              <p className="mt-2 text-neutral-600">
                Accompagnement pour orchestrer les prestataires et le déroulé
                de votre journée.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA doré */}
      <section className="bg-neutral-950 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center text-sm text-neutral-100 md:flex-row md:text-left md:px-6">
          <div>
            <h2 className="text-base font-semibold text-white">
              Prêt à imaginer votre événement à la Villa R.E.E.L ?
            </h2>
            <p className="mt-1 text-xs text-neutral-400">
              Partagez votre projet, vos envies et votre date idéale. Nous
              revenons vers vous pour construire une proposition sur-mesure.
            </p>
          </div>
          <a
            href={`/${locale}/contact`}
            className="inline-flex items-center justify-center rounded-full bg-cta px-5 py-2.5 text-xs font-semibold text-white shadow-md transition hover:opacity-90"
          >
            Discuter de votre événement
          </a>
        </div>
      </section>
    </div>
  );
}

