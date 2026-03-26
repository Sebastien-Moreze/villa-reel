'use client';

import React from "react";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useReservation } from "@/components/reservation/ReservationContext";
import { AnimatedTitle } from "@/components/home/AnimatedTitle";

type HeroSectionProps = {
  locale: string;
};

/* Animation d'entrée : départ invisible + décalé vers le bas, arrivée en fondu */
function fadeUp(ready: boolean, delay: number): React.CSSProperties {
  return {
    opacity: ready ? 1 : 0,
    transform: ready ? "translateY(0) scale(1)" : "translateY(28px) scale(0.98)",
    transition: `opacity 750ms cubic-bezier(0.16,1,0.3,1) ${delay}ms,
                 transform 750ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  };
}

export function HeroSection({ locale }: HeroSectionProps) {
  const t = useTranslations();
  const [ready, setReady] = useState(false);
  const { openDrawer, openAvailability } = useReservation();
  const parallaxRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number>(0);

  /* Parallax optimisé : écrit directement dans le DOM via ref + rAF (pas de re-render) */
  const handleScroll = useCallback(() => {
    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      if (parallaxRef.current) {
        const y = window.scrollY * 0.075;
        parallaxRef.current.style.transform = `translate3d(0,${y}px,0)`;
      }
    });
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, [handleScroll]);

  /* Déclenche l'animation après le premier rendu */
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const buildHref = (path: string) => `/${locale}${path}`;

  return (
    <section className="relative min-h-[80vh] overflow-hidden">
      <div
        ref={parallaxRef}
        className="absolute inset-0 bg-cover bg-center will-change-transform"
        style={{ backgroundImage: "url('/images/hero/hero-banner.jpg')" }}
        role="img"
        aria-label={t("hero.heroImageAlt")}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/70 to-secondary/80" />

      <div className="relative z-10 mx-auto flex min-h-[80vh] max-w-6xl flex-col justify-center px-4 py-24 text-white md:px-6">
        <div className="max-w-2xl space-y-4">
          <p
            style={fadeUp(ready, 0)}
            className="text-xs uppercase tracking-[0.35em] text-white/80"
          >
            {t("hero.eyebrow")}
          </p>
          <AnimatedTitle
            text={t("hero.title")}
            className="font-display block text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
          />
          <p
            style={fadeUp(ready, 300)}
            className="font-display text-lg italic text-white/95 md:text-xl"
          >
            {t("hero.subtitle")}
          </p>
          <p
            style={fadeUp(ready, 450)}
            className="max-w-xl text-sm text-white/90 md:text-base"
          >
            {t("hero.description")}
          </p>

          <div style={fadeUp(ready, 600)} className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={openDrawer}
              className="inline-flex items-center justify-center rounded-full bg-cta px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cta/30 transition hover:opacity-90"
            >
              {t("hero.ctaPrimary")}
            </button>
            <button
              type="button"
              onClick={openAvailability}
              className="inline-flex items-center justify-center rounded-full border border-white/50 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
            >
              {t("hero.ctaSecondary")}
            </button>
            <Link
              href={buildHref("/galerie")}
              className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 backdrop-blur transition hover:bg-white/10"
            >
              {t("hero.ctaTertiary")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
