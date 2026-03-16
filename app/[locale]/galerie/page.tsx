import type { Metadata } from "next";
import { locales } from "@/i18n";
import { GalerieGrid } from "@/components/galerie/GalerieGrid";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata(
  { params }: PageProps,
): Promise<Metadata> {
  const { locale } = await params;
  if (locale === "en") {
    return {
      title: "Villa R.E.E.L – Gallery",
      description:
        "Discover the villa in images: interiors, outdoors, pool, bedrooms and living spaces.",
    };
  }
  return {
    title: "Villa R.E.E.L – Galerie",
    description:
      "Découvrez la villa en images : intérieurs, extérieurs, piscine, chambres et espaces de vie.",
  };
}

export default async function GaleriePage({ params }: PageProps) {
  await params;

  return (
    <div className="pb-16">
      <section className="bg-gradient-to-b from-primary via-primary/95 to-secondary py-16 text-white">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/80">
            Villa R.E.E.L
          </p>
          <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            Galerie
          </h1>
          <p className="mt-3 max-w-xl text-sm text-white/90">
            Découvrez la villa en images : intérieurs, extérieurs, piscine,
            chambres et espaces de vie.
          </p>
        </div>
      </section>

      <section className="bg-background py-12">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <GalerieGrid />
        </div>
      </section>
    </div>
  );
}
