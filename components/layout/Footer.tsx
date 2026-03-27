'use client';

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

export function Footer() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params?.locale as string) ?? "fr";
  const year = new Date().getFullYear();

  const buildHref = (path: string) => `/${locale}${path}`;

  return (
    <footer className="mt-16 bg-[#1A1A1A] text-sm text-neutral-300">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <div className="grid gap-10 md:grid-cols-[2fr,3fr]">
          <div className="space-y-4">
            <div>
              <div className="inline-flex items-baseline gap-2">
                <span className="text-xs font-semibold tracking-[0.3em] text-secondary">VILLA</span>
                <span className="text-xs font-semibold tracking-[0.35em] text-secondary">R.E.E.L</span>
              </div>
              <p className="mt-3 max-w-xs text-xs text-neutral-400">
                Haute-Savoie, France
              </p>
            </div>

            <div className="flex gap-3">
              <a href="https://instagram.com" target="_blank" rel="noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-600 text-neutral-200 transition hover:border-primary hover:text-secondary">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-100">
                {t("footer.nav")}
              </h3>
              <ul className="mt-3 space-y-2 text-xs text-neutral-400">
                <li><Link href={buildHref("")} className="hover:text-secondary">{t("footer.home")}</Link></li>
                <li><Link href={buildHref("/villa")} className="hover:text-secondary">{t("footer.villa")}</Link></li>
                <li><Link href={buildHref("/galerie")} className="hover:text-secondary">{t("footer.gallery")}</Link></li>
                <li><Link href={buildHref("/entreprises")} className="hover:text-secondary">{t("footer.business")}</Link></li>
                <li><Link href={buildHref("/evenements")} className="hover:text-secondary">{t("footer.events")}</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-100">
                {t("footer.services")}
              </h3>
              <ul className="mt-3 space-y-2 text-xs text-neutral-400">
                <li><Link href={buildHref("/reservation")} className="hover:text-secondary">{t("footer.booking")}</Link></li>
                <li><Link href={buildHref("/evenements")} className="hover:text-secondary">{t("footer.events")}</Link></li>
                <li><Link href={buildHref("/entreprises")} className="hover:text-secondary">{t("footer.business")}</Link></li>
                <li><Link href={buildHref("/collaborateurs")} className="hover:text-secondary">{t("footer.partners")}</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-100">
                {t("footer.legal")}
              </h3>
              <ul className="mt-3 space-y-2 text-xs text-neutral-400">
                <li><Link href={buildHref("/mentions-legales")} className="hover:text-secondary">{t("footer.legalNotice")}</Link></li>
                <li><Link href={buildHref("/cgv")} className="hover:text-secondary">{t("footer.terms")}</Link></li>
                <li><Link href={buildHref("/confidentialite")} className="hover:text-secondary">{t("footer.privacy")}</Link></li>
                <li><Link href={buildHref("/reglement-interieur")} className="hover:text-secondary">{t("footer.houseRules")}</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-100">
                {t("footer.contact")}
              </h3>
              <ul className="mt-3 space-y-2 text-xs text-neutral-400">
                <li><a href="mailto:contact@villareel.com" className="hover:text-secondary">contact@villareel.com</a></li>
                <li><a href="tel:+33688423052" className="hover:text-secondary">+33 (0)6 88 42 30 52</a></li>
                <li><a href="tel:+33680215157" className="hover:text-secondary">+33 (0)6 80 21 51 57</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-800">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-4 text-[11px] text-neutral-500 md:flex-row md:px-6">
            <p>Copyright © {year} {t("footer.copyright")}</p>
            <p>
              Site réalisé par{" "}
              <a
                href="https://saanesu.com"
                target="_blank"
                rel="noreferrer"
                className="text-neutral-400 hover:text-secondary transition-colors"
              >
                saanesu
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
