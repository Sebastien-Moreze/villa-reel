'use client';

import { useTranslations } from "next-intl";

export function FeaturesSection() {
  const t = useTranslations();

  const features = [
    {
      key: "pool",
      image: "/images/gallery/gallery-piscine-coucher-soleil.jpg",
    },
    {
      key: "view",
      image: "/images/gallery/gallery-vue-montagnes.jpg",
    },
    {
      key: "garden",
      image: "/images/gallery/gallery-jardin-palmier.jpg",
    },
    {
      key: "billiard",
      image: "/images/gallery/gallery-salle-billard-tv.jpg",
    },
  ] as const;

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <h2 className="font-display text-center text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          {t("features.eyebrow")}
        </h2>
        <p className="font-display mt-2 text-center text-2xl font-semibold text-neutral-900 md:text-3xl">
          {t("features.title")}
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.key}
              className="group relative flex h-64 flex-col justify-end overflow-hidden rounded-2xl shadow-md transition hover:-translate-y-1 hover:shadow-xl"
              role="img"
              aria-label={t(`features.${feature.key}.title`)}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url('${feature.image}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="relative z-10 p-5">
                <h3 className="text-sm font-semibold text-white drop-shadow">
                  {t(`features.${feature.key}.title`)}
                </h3>
                <p className="mt-1 text-xs text-white/80 leading-relaxed">
                  {t(`features.${feature.key}.desc`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
