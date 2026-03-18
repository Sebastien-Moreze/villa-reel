import { getTranslations } from "next-intl/server";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function EvenementsPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations();

  return (
    <div className="pb-16">
      <section className="bg-gradient-to-b from-violet-950 via-fuchsia-900 to-neutral-950 py-20 text-white">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-fuchsia-200">
            {t("evenements.eyebrow")}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            {t("evenements.title")}
          </h1>
          <p className="mt-3 max-w-xl text-sm text-fuchsia-100/90">
            {t("evenements.subtitle")}
          </p>
        </div>
      </section>

      <section className="bg-neutral-950 py-12">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-5 md:grid-cols-2">
            {([
              { num: 1, color: "from-violet-700 to-fuchsia-700" },
              { num: 2, color: "from-primary to-secondary" },
              { num: 3, color: "from-cta/90 to-cta" },
              { num: 4, color: "from-slate-900 to-indigo-800" },
            ] as const).map(({ num, color }) => (
              <article
                key={num}
                className="overflow-hidden rounded-2xl border border-white/5 bg-neutral-900/60 shadow-lg"
              >
                <div className={`h-2 bg-gradient-to-r ${color}`} />
                <div className="p-5 text-sm text-neutral-100">
                  <h2 className="text-base font-semibold">{t(`evenements.event${num}.title`)}</h2>
                  <p className="mt-2 text-xs text-neutral-300">{t(`evenements.event${num}.desc`)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f6f3ff] py-14">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-800">
            {t("evenements.servicesEyebrow")}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-neutral-800">
            {t("evenements.servicesSubtitle")}
          </p>

          <div className="mt-8 grid gap-4 text-xs text-neutral-800 md:grid-cols-3">
            {([1, 2, 3, 4, 5, 6] as const).map((num) => (
              <div key={num} className="rounded-2xl bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-neutral-900">
                  {t(`evenements.service${num}.title`)}
                </h3>
                <p className="mt-2 text-neutral-600">
                  {t(`evenements.service${num}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-neutral-950 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center text-sm text-neutral-100 md:flex-row md:text-left md:px-6">
          <div>
            <h2 className="text-base font-semibold text-white">{t("evenements.ctaTitle")}</h2>
            <p className="mt-1 text-xs text-neutral-400">{t("evenements.ctaDesc")}</p>
          </div>
          <a
            href={`/${locale}/contact`}
            className="inline-flex items-center justify-center rounded-full bg-cta px-5 py-2.5 text-xs font-semibold text-white shadow-md transition hover:opacity-90"
          >
            {t("evenements.ctaBtn")}
          </a>
        </div>
      </section>
    </div>
  );
}
