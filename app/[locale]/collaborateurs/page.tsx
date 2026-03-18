type PageProps = {
  params: { locale: string };
};

export default function CollaborateursPage(_props: PageProps) {
  return (
    <div className="pb-16">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-primary/95 to-secondary py-18 py-16 text-white">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/80">
            Villa R.E.E.L
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            Nos Collaborateurs
          </h1>
          <p className="mt-3 max-w-xl text-sm text-white/90/90">
            Des partenaires de confiance pour enrichir votre séjour : œnologie,
            gastronomie, expériences sur-mesure.
          </p>
        </div>
      </section>

      {/* Collaborators cards */}
      <section className="bg-[#f6f7f8] py-14">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-5 md:grid-cols-2">
            <article className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-violet-900 to-fuchsia-800 p-5 text-sm text-violet-50 shadow-md">
              <div>
                <h2 className="text-base font-semibold">ViniLux</h2>
                <p className="mt-2 text-xs text-violet-100">
                  Caviste et partenaire œnologique, ViniLux propose des
                  sélections de vins, ateliers dégustation et accords mets &amp;
                  vins pour vos soirées, séminaires ou événements privés à la
                  villa.
                </p>
              </div>
              <a
                href="https://vinilux.ch"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex w-max items-center justify-center rounded-full bg-white/10 px-4 py-2 text-[11px] font-semibold text-violet-50 hover:bg-white/20"
              >
                Découvrir ViniLux
              </a>
            </article>

            <article className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-primary to-secondary p-5 text-sm text-white shadow-md">
              <div>
                <h2 className="text-base font-semibold">Félicien Christe</h2>
                <p className="mt-2 text-xs text-white/90">
                  Chef privé, Félicien Christe imagine des menus personnalisés,
                  dîners intimistes, brunchs et cocktails dînatoires pour vos
                  séjours et événements à la Villa R.E.E.L.
                </p>
              </div>
              <p className="mt-4 text-[11px] text-white/90/90">
                Sur demande, il peut intervenir pour vos séjours privés,
                événements professionnels ou célébrations spéciales.
              </p>
            </article>
          </div>

          <p className="mt-8 text-center text-[11px] text-neutral-600">
            Ces services sont optionnels et indépendants du prix de location de
            la villa. Ils font l&apos;objet de devis et de facturations
            séparées auprès de chaque prestataire.
          </p>
        </div>
      </section>
    </div>
  );
}

