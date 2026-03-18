'use client';

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type HeroSectionProps = {
  locale: string;
};

export function HeroSection({ locale }: HeroSectionProps) {
  const t = useTranslations();
  const [offset, setOffset] = useState(0);
  const router = useRouter();
  const checkInRef = useRef<HTMLInputElement>(null);
  const checkOutRef = useRef<HTMLInputElement>(null);
  const guestsRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => { setOffset(window.scrollY * 0.15); };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const buildHref = (path: string) => `/${locale}${path}`;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (checkInRef.current?.value)  params.set("checkIn",  checkInRef.current.value);
    if (checkOutRef.current?.value) params.set("checkOut", checkOutRef.current.value);
    if (guestsRef.current?.value)   params.set("guests",   guestsRef.current.value);
    router.push(`/${locale}/reservation?${params.toString()}`);
  }

  return (
    <section className="relative min-h-[80vh] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/hero/hero-banner.jpg')",
          transform: `translateY(${offset * 0.5}px)`,
          transition: "transform 0.1s linear",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/70 to-secondary/80" />

      <div className="relative z-10 mx-auto flex min-h-[80vh] max-w-6xl flex-col justify-center px-4 py-24 text-white md:px-6">
        <div className="max-w-2xl space-y-4">
          <p className="text-xs uppercase tracking-[0.35em] text-white/80">
            {t("hero.eyebrow")}
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            {t("hero.title")}
          </h1>
          <p className="font-display text-lg italic text-white/95 md:text-xl">
            {t("hero.subtitle")}
          </p>
          <p className="max-w-xl text-sm text-white/90 md:text-base">
            {t("hero.description")}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={buildHref("/reservation")}
              className="inline-flex items-center justify-center rounded-full bg-cta px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cta/30 transition hover:opacity-90"
            >
              {t("hero.ctaPrimary")}
            </Link>
            <Link
              href={buildHref("/villa")}
              className="inline-flex items-center justify-center rounded-full border border-white/50 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
            >
              {t("hero.ctaSecondary")}
            </Link>
          </div>
        </div>

        {/* Floating search bar */}
        <div className="mt-10">
          <div className="w-full max-w-3xl rounded-2xl bg-white/95 p-4 shadow-2xl shadow-primary/20 backdrop-blur">
            <form
              className="grid gap-3 text-sm text-neutral-800 sm:grid-cols-[1.2fr,1.2fr,1fr,auto]"
              onSubmit={handleSearch}
            >
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-neutral-500">{t("hero.checkIn")}</label>
                <input
                  ref={checkInRef}
                  type="date"
                  name="checkIn"
                  min={new Date().toISOString().split("T")[0]}
                  className="mt-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-neutral-500">{t("hero.checkOut")}</label>
                <input
                  ref={checkOutRef}
                  type="date"
                  name="checkOut"
                  min={new Date().toISOString().split("T")[0]}
                  className="mt-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-neutral-500">{t("hero.guests")}</label>
                <input
                  ref={guestsRef}
                  type="number"
                  name="guests"
                  min={1}
                  className="mt-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder={t("hero.guestsPlaceholder")}
                />
              </div>
              <button
                type="submit"
                className="mt-4 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-xs font-semibold text-white shadow-md transition hover:opacity-90 sm:mt-5"
              >
                {t("hero.checkAvailability")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
