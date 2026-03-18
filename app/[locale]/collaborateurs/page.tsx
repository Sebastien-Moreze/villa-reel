import { getTranslations } from "next-intl/server";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function CollaborateursPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return (
    <div className="pb-16">
      <section className="bg-gradient-to-br from-primary via-primary/95 to-secondary py-18 py-16 text-white">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/80">
            {t("collaborateurs.eyebrow")}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            {t("collaborateurs.title")}
          </h1>
          <p className="mt-3 max-w-xl text-sm text-white/90/90">
            {t("collaborateurs.subtitle")}
          </p>
        </div>
      </section>

      <section className="bg-[#f6f7f8] py-14">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-5 md:grid-cols-2">
            <article className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-violet-900 to-fuchsia-800 p-5 text-sm text-violet-50 shadow-md">
              <div>
                <h2 className="text-base font-semibold">{t("collaborateurs.vinilux.name")}</h2>
                <p className="mt-2 text-xs text-violet-100">
                  {t("collaborateurs.vinilux.desc")}
                </p>
              </div>
              <a
                href="https://vinilux.ch"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex w-max items-center justify-center rounded-full bg-white/10 px-4 py-2 text-[11px] font-semibold text-violet-50 hover:bg-white/20"
              >
                {t("collaborateurs.vinilux.cta")}
              </a>
            </article>

            <article className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-primary to-secondary p-5 text-sm text-white shadow-md">
              <div>
                <h2 className="text-base font-semibold">{t("collaborateurs.chef.name")}</h2>
                <p className="mt-2 text-xs text-white/90">
                  {t("collaborateurs.chef.desc")}
                </p>
              </div>
              <p className="mt-4 text-[11px] text-white/90/90">
                {t("collaborateurs.chef.note")}
              </p>
            </article>
          </div>

          <p className="mt-8 text-center text-[11px] text-neutral-600">
            {t("collaborateurs.disclaimer")}
          </p>
        </div>
      </section>
    </div>
  );
}
