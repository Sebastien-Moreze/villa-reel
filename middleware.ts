import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n";

/**
 * Middleware next-intl — gestion des locales FR / EN
 *
 * - Les routes /admin/* sont exclues du routing i18n (matcher ci-dessous)
 * - Les routes /api/*  sont exclues également
 * - Toutes les autres routes publiques bénéficient du préfixe de locale
 */
export default createMiddleware({
  locales,
  defaultLocale,
  // /fr/... est la forme canonique ; / redirige vers /fr/
  localePrefix: "always",
});

export const config = {
  // Appliquer le middleware uniquement aux routes publiques i18n.
  // On exclut explicitement : admin, api, _next, fichiers statiques.
  matcher: [
    "/((?!admin|api|_next/static|_next/image|favicon.ico|icon-|apple-touch|images|sitemap|robots).*)",
  ],
};
