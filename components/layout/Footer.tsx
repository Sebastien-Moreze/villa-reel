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
                1281 route de Moussy,<br />
                74930 Reigner-Esery, France
              </p>
            </div>

            <div className="flex gap-3">
              <a href="https://instagram.com" target="_blank" rel="noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-600 text-xs font-medium text-neutral-200 transition hover:border-primary hover:text-secondary">
                IG
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-600 text-xs font-medium text-neutral-200 transition hover:border-primary hover:text-secondary">
                FB
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
                <li><Link href="/mentions-legales" className="hover:text-secondary">{t("footer.legalNotice")}</Link></li>
                <li><Link href="/cgv" className="hover:text-secondary">{t("footer.terms")}</Link></li>
                <li><Link href="/confidentialite" className="hover:text-secondary">{t("footer.privacy")}</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-100">
                {t("footer.contact")}
              </h3>
              <ul className="mt-3 space-y-2 text-xs text-neutral-400">
                <li><a href="mailto:contact@villareel.fr" className="hover:text-secondary">contact@villareel.fr</a></li>
                <li><a href="tel:+33600000000" className="hover:text-secondary">+33 (0)6 00 00 00 00</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-800">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-4 text-[11px] text-neutral-500 md:flex-row md:px-6">
            <p>Copyright © {year} {t("footer.copyright")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
