import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { BookingCtaBanner } from "@/components/shared/BookingCtaBanner";

const BASE = "https://www.villareel.com";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";
  const title = isEn ? "Our Partners – Villa R.E.E.L" : "Nos Partenaires – Villa R.E.E.L";
  const description = isEn
    ? "Discover our trusted partners: event planning with Elegance Events and premium decoration with Maison Sofya."
    : "Découvrez nos partenaires de confiance : organisation événementielle avec Elegance Events et décoration premium avec Maison Sofya.";
  return {
    title,
    description,
    alternates: { canonical: `${BASE}/${locale}/collaborateurs`, languages: { fr: `${BASE}/fr/collaborateurs`, en: `${BASE}/en/collaborateurs` } },
    openGraph: { title, description, url: `${BASE}/${locale}/collaborateurs`, siteName: "Villa R.E.E.L", type: "website" },
  };
}

export default async function CollaborateursPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return (
    <div className="pb-20">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-primary via-primary/95 to-secondary py-16 text-white">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/80">
            {t("collaborateurs.eyebrow")}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            {t("collaborateurs.title")}
          </h1>
          <p className="mt-3 max-w-xl text-sm text-white/90">
            {t("collaborateurs.subtitle")}
          </p>
        </div>
      </section>

      {/* ── Chef Félicien Christe ─────────────────────────────────────── */}
      <section className="bg-[#f6f7f8] py-14">
        <div className="mx-auto max-w-6xl px-4 md:px-6">

          {/* Chef card — large featured */}
          <article className="overflow-hidden rounded-3xl bg-white shadow-lg">
            <div className="flex flex-col md:flex-row">

              {/* Photo area */}
              <div className="relative flex-shrink-0 overflow-hidden md:w-72 lg:w-80">
                <div className="relative h-64 w-full md:h-full">
                  <Image
                    src="/images/collaborators/felicien-christe.jpg"
                    alt="Félicien Christe – Executive Chef"
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 100vw, 320px"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col justify-between p-7 md:p-8 lg:p-10">
                <div>
                  {/* Tag */}
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">
                    {t("collaborateurs.chef.tag")}
                  </p>

                  {/* Name */}
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900 md:text-3xl">
                    {t("collaborateurs.chef.name")}
                  </h2>
                  <p className="mt-0.5 text-sm text-neutral-500">
                    {t("collaborateurs.chef.role")}
                  </p>

                  {/* Gault & Millau badge */}
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5">
                    <svg
                      className="h-4 w-4 text-amber-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-xs font-semibold text-amber-700">
                      {t("collaborateurs.chef.award")}
                    </span>
                    <span className="text-[10px] text-amber-600">
                      — {t("collaborateurs.chef.awardLabel")}
                    </span>
                  </div>

                  {/* Bio */}
                  <div className="mt-5 space-y-3 text-sm leading-relaxed text-neutral-600">
                    <p>{t("collaborateurs.chef.bio1")}</p>
                    <p>{t("collaborateurs.chef.bio2")}</p>
                  </div>

                  {/* Career timeline */}
                  <div className="mt-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                      {t("collaborateurs.chef.careerTitle")}
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {(
                        [
                          t("collaborateurs.chef.career1"),
                          t("collaborateurs.chef.career2"),
                          t("collaborateurs.chef.career3"),
                          t("collaborateurs.chef.career4"),
                        ] as string[]
                      ).map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-neutral-500">
                          <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary/60" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Note */}
                  <p className="mt-5 rounded-xl bg-neutral-50 px-4 py-3 text-xs italic text-neutral-500">
                    {t("collaborateurs.chef.note")}
                  </p>
                </div>

                {/* Links */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="https://ch.linkedin.com/in/felicien-christe-63573bb2"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[#0A66C2] px-4 py-2 text-[11px] font-semibold text-white shadow-sm transition hover:bg-[#0855A0]"
                  >
                    {/* LinkedIn icon */}
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    {t("collaborateurs.chef.ctaLinkedIn")}
                  </a>
                  <a
                    href="https://guardagolf.com/restaurant-five"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-[11px] font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50"
                  >
                    <svg className="h-3.5 w-3.5 text-neutral-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    {t("collaborateurs.chef.ctaRestaurant")}
                  </a>
                </div>
              </div>
            </div>
          </article>

          {/* ── ViniLux card ────────────────────────────────────────────── */}
          <article className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900 to-fuchsia-800 shadow-lg">
            <div className="flex flex-col md:flex-row">
              {/* Photo area */}
              <div className="relative flex-shrink-0 overflow-hidden md:w-72 lg:w-80">
                <div className="relative h-64 w-full md:h-full">
                  <Image
                    src="/images/collaborators/vinilux.jpg"
                    alt="ViniLux – Caviste & Partenaire Œnologique"
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, 320px"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col justify-between p-7 md:p-8 lg:p-10">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-violet-300">
                    {t("collaborateurs.vinilux.tag")}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-white md:text-2xl">
                    {t("collaborateurs.vinilux.name")}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-violet-100">
                    {t("collaborateurs.vinilux.desc")}
                  </p>
                  <p className="mt-2 text-[11px] text-violet-300">
                    {t("collaborateurs.vinilux.services")}
                  </p>
                </div>
                <div className="mt-6">
                  <a
                    href="https://vinilux.ch"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/25"
                  >
                    {t("collaborateurs.vinilux.cta")}
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </article>

          {/* ── Elegance Events Organisation ────────────────────────────── */}
          <article className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-rose-900 to-pink-800 shadow-lg">
            <div className="flex flex-col md:flex-row">
              {/* Logo area */}
              <div className="flex flex-shrink-0 items-center justify-center bg-black/40 md:w-72 lg:w-80">
                <div className="relative h-48 w-48 md:h-56 md:w-56">
                  <Image
                    src="/images/collaborators/elegance-events.jpg"
                    alt="Elegance Events Organisation"
                    fill
                    className="object-contain"
                    sizes="224px"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col justify-between p-7 md:p-8 lg:p-10">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-rose-300">
                    {t("collaborateurs.elegance.tag")}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-white md:text-2xl">
                    {t("collaborateurs.elegance.name")}
                  </h2>
                  <p className="mt-0.5 text-sm text-rose-200">
                    {t("collaborateurs.elegance.contact")}
                  </p>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-rose-100">
                    {t("collaborateurs.elegance.desc")}
                  </p>
                  <p className="mt-2 text-[11px] text-rose-300">
                    {t("collaborateurs.elegance.services")}
                  </p>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="https://www.instagram.com/elegance_organisation_mariage"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/25"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                    {t("collaborateurs.elegance.ctaInstagram")}
                  </a>
                  <a
                    href="mailto:haticeoguz@live.fr"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    {t("collaborateurs.elegance.ctaContact")}
                  </a>
                </div>
              </div>
            </div>
          </article>

          {/* ── Maison Sofya ─────────────────────────────────────────────── */}
          <article className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 to-teal-800 shadow-lg">
            <div className="flex flex-col md:flex-row">
              {/* Logo area */}
              <div className="flex flex-shrink-0 items-center justify-center bg-black/40 md:w-72 lg:w-80">
                <div className="relative h-48 w-48 md:h-56 md:w-56">
                  <Image
                    src="/images/collaborators/maison-sofya.jpg"
                    alt="Maison Sofya – Décoration & Scénographie"
                    fill
                    className="object-contain"
                    sizes="224px"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col justify-between p-7 md:p-8 lg:p-10">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-300">
                    {t("collaborateurs.sofya.tag")}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-white md:text-2xl">
                    {t("collaborateurs.sofya.name")}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-emerald-100">
                    {t("collaborateurs.sofya.desc")}
                  </p>
                  <p className="mt-2 text-[11px] text-emerald-300">
                    {t("collaborateurs.sofya.services")}
                  </p>
                </div>
                <div className="mt-6">
                  <a
                    href="https://www.instagram.com/maison_sofya"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/25"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                    {t("collaborateurs.sofya.ctaInstagram")}
                  </a>
                </div>
              </div>
            </div>
          </article>

          {/* ── Saanesu ───────────────────────────────────────────────── */}
          <article className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-amber-900 to-orange-800 shadow-lg">
            <div className="flex flex-col md:flex-row">
              {/* Logo area */}
              <div className="flex flex-shrink-0 items-center justify-center p-6 md:w-72 lg:w-80">
                <div className="relative h-48 w-48 overflow-hidden rounded-2xl bg-white p-4 shadow-md md:h-56 md:w-56">
                  <Image
                    src="/images/collaborators/saanesu.png"
                    alt="Saanesu – Développement Web & Solutions Digitales"
                    fill
                    className="object-contain p-2"
                    sizes="224px"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col justify-between p-7 md:p-8 lg:p-10">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-300">
                    {t("collaborateurs.saanesu.tag")}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-white md:text-2xl">
                    {t("collaborateurs.saanesu.name")}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-amber-100">
                    {t("collaborateurs.saanesu.desc")}
                  </p>
                  <p className="mt-2 text-[11px] text-amber-300">
                    {t("collaborateurs.saanesu.services")}
                  </p>
                </div>
                <div className="mt-6">
                  <a
                    href="https://www.saanesu.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/25"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                    {t("collaborateurs.saanesu.ctaSite")}
                  </a>
                </div>
              </div>
            </div>
          </article>

          {/* Disclaimer */}
          <p className="mt-8 text-center text-[11px] text-neutral-500">
            {t("collaborateurs.disclaimer")}
          </p>
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
