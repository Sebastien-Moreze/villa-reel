import { getTranslations } from "next-intl/server";
import Image from "next/image";

type PageProps = {
  params: Promise<{ locale: string }>;
};

// Photos Unsplash libres de droit — une par formule
const FORMULE_PHOTOS: Record<string, string> = {
  seminaires:   "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80&fit=crop&auto=format",
  teambuilding: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80&fit=crop&auto=format",
  incentive:    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80&fit=crop&auto=format",
  formations:   "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80&fit=crop&auto=format",
  soirees:      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80&fit=crop&auto=format",
  lancements:   "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80&fit=crop&auto=format",
};

// Photos pour la section "Pourquoi choisir la Villa"
const WHY_PHOTOS = [
  "/images/gallery/gallery-piscine-coucher-soleil.jpg",   // Havre hors du bureau
  "/images/gallery/gallery-terrasse-rooftop-salon.jpg",   // Espaces intérieurs & extérieurs
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80&fit=crop&auto=format", // Partenaires sur mesure
];

const formuleKeys = [
  "seminaires", "teambuilding", "incentive",
  "formations", "soirees", "lancements",
] as const;

export default async function EntreprisesPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return (
    <div className="pb-16">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
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
            {(["capacity", "surface", "rooms", "pool"] as const).map((key) => (
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

      {/* ── Formules ─────────────────────────────────────────────────── */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            {t("entreprises.formulesEyebrow")}
          </h2>
          <p className="mt-2 text-center text-xl font-semibold text-neutral-900 md:text-2xl">
            {t("entreprises.formulesTitle")}
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {formuleKeys.map((key) => (
              <article
                key={key}
                className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-md transition hover:shadow-lg"
              >
                {/* Photo */}
                <div className="relative h-44 w-full overflow-hidden">
                  <Image
                    src={FORMULE_PHOTOS[key]}
                    alt={t(`entreprises.formule.${key}`)}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  {/* Overlay avec titre */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <h3 className="absolute bottom-3 left-4 text-sm font-semibold text-white">
                    {t(`entreprises.formule.${key}`)}
                  </h3>
                </div>

                {/* Description */}
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-xs leading-relaxed text-neutral-600">
                    {t(`entreprises.formule.${key}Desc`)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pourquoi choisir la Villa ─────────────────────────────────── */}
      <section className="bg-[#f6f7f8] py-14">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            {t("entreprises.whyEyebrow")}
          </h2>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {([1, 2, 3] as const).map((num, i) => (
              <div
                key={num}
                className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md"
              >
                {/* Photo */}
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={WHY_PHOTOS[i]}
                    alt={t(`entreprises.why${num}.title`)}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                </div>

                {/* Text */}
                <div className="p-5 space-y-2">
                  <h3 className="text-sm font-semibold text-neutral-900">
                    {t(`entreprises.why${num}.title`)}
                  </h3>
                  <p className="text-xs leading-relaxed text-neutral-600">
                    {t(`entreprises.why${num}.desc`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
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
