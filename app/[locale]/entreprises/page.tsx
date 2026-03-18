import { getTranslations } from "next-intl/server";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function EntreprisesPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  const formules = [
    "seminaires", "teambuilding", "incentive",
    "formations", "soirees", "lancements",
  ] as const;

  return (
    <div className="pb-16">
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-950 via-neutral-900 to-primary/90 py-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 md:flex-row md:items-center md:px-6">
          <div className="flex-1 space-y-3 text-white">
            <p className="text-xs uppercase tracking-[0.3em] text-secondary">
              {t("entreprises.eyebrow")}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {t("entreprises.title")}
            </h1>
            <p className="max-w-xl text-sm text-neutral-200">
              {t("entreprises.subtitle")}
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-neutral-800/80 bg-black/40">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-6 text-xs text-neutral-200 md:grid-cols-4 md:px-6">
            {(["capacity","surface","rooms","pool"] as const).map((key) => (
              <div key={key} className="space-y-1">
                <div className="text-[11px] uppercase tracking-wide text-neutral-400">
                  {t(`entreprises.stat.${key}.label`)}
                </div>
                <div className="text-xs font-semibold text-neutral-50">
                  {t(`entreprises.stat.${key}.value`)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            {t("entreprises.formulesEyebrow")}
          </h2>
          <p className="mt-2 text-center text-xl font-semibold text-neutral-900 md:text-2xl">
            {t("entreprises.formulesTitle")}
          </p>

          <div className="mt-8 grid gap-4 text-sm text-neutral-800 md:grid-cols-3">
            {formules.map((key) => (
              <article
                key={key}
                className="flex h-full flex-col rounded-2xl border border-primary/10 bg-primary/5 p-4 shadow-sm"
              >
                <h3 className="text-sm font-semibold text-neutral-900">
                  {t(`entreprises.formule.${key}`)}
                </h3>
                <p className="mt-2 text-xs text-neutral-600">
                  {t("entreprises.formule.desc")}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f6f7f8] py-14">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            {t("entreprises.whyEyebrow")}
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {([
              { num: 1, gradient: "from-primary to-secondary" },
              { num: 2, gradient: "from-primary/80 to-slate-900" },
              { num: 3, gradient: "from-secondary to-primary/60" },
            ] as const).map(({ num, gradient }) => (
              <div key={num} className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
                <div className={`h-32 rounded-xl bg-gradient-to-br ${gradient}`} />
                <h3 className="text-sm font-semibold text-neutral-900">
                  {t(`entreprises.why${num}.title`)}
                </h3>
                <p className="text-xs text-neutral-600">
                  {t(`entreprises.why${num}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-neutral-950 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center text-sm text-neutral-100 md:flex-row md:text-left md:px-6">
          <div>
            <h2 className="text-base font-semibold text-white">
              {t("entreprises.ctaTitle")}
            </h2>
            <p className="mt-1 text-xs text-neutral-400">
              {t("entreprises.ctaDesc")}
            </p>
          </div>
          <a
            href={`/${locale}/contact`}
            className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-xs font-semibold text-neutral-900 shadow-md transition hover:bg-neutral-100"
          >
            {t("entreprises.ctaBtn")}
          </a>
        </div>
      </section>
    </div>
  );
}
