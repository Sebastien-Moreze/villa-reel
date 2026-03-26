import type { Metadata } from "next";
import { locales } from "@/i18n";
import { GalerieGrid } from "@/components/galerie/GalerieGrid";
import { getTranslations } from "next-intl/server";
import { BookingCtaBanner } from "@/components/shared/BookingCtaBanner";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return {
    title: `Villa R.E.E.L – ${t("galerie.title")}`,
    description: t("galerie.subtitle"),
  };
}

export default async function GaleriePage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return (
    <div className="pb-16">
      <section className="bg-gradient-to-b from-primary via-primary/95 to-secondary py-16 text-white">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/80">
            {t("galerie.eyebrow")}
          </p>
          <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            {t("galerie.title")}
          </h1>
          <p className="mt-3 max-w-xl text-sm text-white/90">
            {t("galerie.subtitle")}
          </p>
        </div>
      </section>

      <section className="bg-background py-12">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <GalerieGrid />
        </div>
      </section>

      <BookingCtaBanner
        locale={locale}
        title={t("ctaBanner.title")}
        desc={t("ctaBanner.desc")}
        btn={t("ctaBanner.btn")}
      />

    </div>
  );
}
