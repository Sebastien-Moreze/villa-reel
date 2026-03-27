import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { getTranslations } from "next-intl/server";

const BASE = "https://www.villareel.com";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";
  const title = isEn ? "Contact Us – Villa R.E.E.L" : "Contact – Villa R.E.E.L";
  const description = isEn
    ? "Get in touch with Villa R.E.E.L for bookings, events or any enquiry. We respond within 24 hours."
    : "Contactez Villa R.E.E.L pour réservations, événements ou toute demande. Nous répondons sous 24 heures.";
  return {
    title,
    description,
    alternates: { canonical: `${BASE}/${locale}/contact`, languages: { fr: `${BASE}/fr/contact`, en: `${BASE}/en/contact` } },
    openGraph: { title, description, url: `${BASE}/${locale}/contact`, siteName: "Villa R.E.E.L", type: "website" },
  };
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return (
    <div className="pb-16">
      <section className="bg-gradient-to-b from-neutral-950 via-neutral-900 to-primary/90 py-18 py-16 text-white">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-secondary">
            {t("contact.eyebrow")}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            {t("contact.title")}
          </h1>
          <p className="mt-3 max-w-xl text-sm text-neutral-200">
            {t("contact.subtitle")}
          </p>
        </div>
      </section>

      <section className="bg-[#f6f7f8] py-14">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 md:flex-row md:px-6">
          <div className="flex-1 rounded-2xl bg-white p-5 shadow-sm md:p-6">
            <ContactForm locale={locale} />
          </div>

          <aside className="w-full md:w-[320px]">
            <div className="rounded-2xl bg-neutral-900 p-5 text-xs text-neutral-100 shadow-md">
              <h2 className="text-sm font-semibold text-white">
                {t("contact.infoTitle")}
              </h2>
              <p className="mt-2 text-[11px] text-neutral-300">
                Reignier-Esery, France
              </p>
              <p className="mt-2 text-[11px] text-neutral-300">
                {t("contact.email")}{" "}
                <a href="mailto:contact@villareel.com" className="text-secondary hover:text-white">
                  contact@villareel.com
                </a>
                <br />
                {t("contact.phone")}{" "}
                <a href="tel:+33688423052" className="text-secondary hover:text-white">
                  +33 (0)6 88 42 30 52
                </a>
                {" / "}
                <a href="tel:+33680215157" className="text-secondary hover:text-white">
                  +33 (0)6 80 21 51 57
                </a>
              </p>

              <div className="mt-5 rounded-xl bg-neutral-800 p-4 text-[11px] text-neutral-200">
                <p className="font-semibold">{t("contact.bookTitle")}</p>
                <p className="mt-1 text-neutral-300">{t("contact.bookDesc")}</p>
                <a
                  href={`/${locale}/villa`}
                  className="mt-3 inline-flex items-center justify-center rounded-full bg-white px-4 py-1.5 text-[11px] font-semibold text-neutral-900"
                >
                  {t("contact.bookCta")}
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
