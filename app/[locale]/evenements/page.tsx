import { getTranslations } from "next-intl/server";
import Image from "next/image";

type PageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Photos Pexels — IDs numériques vérifiés directement depuis les URLs pexels.com
 *
 * Fiançailles  : 30538464  "Celebratory Champagne Toast in Black and White"
 * Mariages     : 15242526  "Flower Arch at Outdoor Wedding Ceremony"
 * Anniversaires: 30469068  "Elegant Floral Birthday Cake with Sugar Flowers"
 * EVJF / EVG   : 19193198  "Women Splashing Champagne during a Celebration"
 * Chef privé   :  1267320  "Chef Preparing Vegetable Dish on Tree Slab"
 * ViniLux/vin  :    94437  "Red Wine Bottle and Glass — moody elegant"
 */
const EVENT_PHOTOS = [
  "https://images.pexels.com/photos/30538464/pexels-photo-30538464.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/15242526/pexels-photo-15242526.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/30469068/pexels-photo-30469068.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/19193198/pexels-photo-19193198.jpeg?auto=compress&cs=tinysrgb&w=900",
];

const SERVICE_PHOTOS = [
  "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=900",
  "https://images.pexels.com/photos/94437/pexels-photo-94437.jpeg?auto=compress&cs=tinysrgb&w=900",
];

const eventNums = [1, 2, 3, 4] as const;

export default async function EvenementsPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return (
    <div className="pb-16">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
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

      {/* ── Types d'événements ───────────────────────────────────────── */}
      <section className="bg-neutral-950 py-12">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-5 md:grid-cols-2">
            {eventNums.map((num, i) => (
              <article
                key={num}
                className="group overflow-hidden rounded-2xl border border-white/5 bg-neutral-900/60 shadow-lg"
              >
                {/* Photo */}
                <div className="relative h-64 w-full overflow-hidden">
                  <Image
                    src={EVENT_PHOTOS[i]}
                    alt={t(`evenements.event${num}.title`)}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <h2 className="absolute bottom-3 left-4 text-base font-semibold text-white">
                    {t(`evenements.event${num}.title`)}
                  </h2>
                </div>
                {/* Description */}
                <div className="p-5">
                  <p className="text-xs leading-relaxed text-neutral-300">
                    {t(`evenements.event${num}.desc`)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services & partenaires ───────────────────────────────────── */}
      <section className="bg-[#f6f3ff] py-14">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-800">
            {t("evenements.servicesEyebrow")}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-neutral-800">
            {t("evenements.servicesSubtitle")}
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {([1, 2] as const).map((num, i) => (
              <div
                key={num}
                className="group overflow-hidden rounded-2xl bg-white shadow-md transition hover:shadow-xl"
              >
                {/* Photo — plus grande pour l'effet luxe */}
                <div className="relative h-64 w-full overflow-hidden">
                  <Image
                    src={SERVICE_PHOTOS[i]}
                    alt={t(`evenements.service${num}.title`)}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <h3 className="absolute bottom-4 left-5 text-base font-semibold text-white drop-shadow">
                    {t(`evenements.service${num}.title`)}
                  </h3>
                </div>
                {/* Text */}
                <div className="p-5">
                  <p className="text-sm leading-relaxed text-neutral-600">
                    {t(`evenements.service${num}.desc`)}
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
              {t("evenements.ctaTitle")}
            </h2>
            <p className="mt-1 text-xs text-neutral-400">
              {t("evenements.ctaDesc")}
            </p>
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
