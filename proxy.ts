import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import createIntlMiddleware from "next-intl/middleware";

/* Constantes définies ici — ne pas importer depuis ./i18n pour éviter
   que getRequestConfig (API serveur) s'exécute dans le runtime Edge. */
const locales = ["fr", "en"] as const;
const defaultLocale = "fr" as const;

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

/* Routes accessibles même en mode maintenance */
const MAINTENANCE_BYPASS = [
  "/maintenance",
  "/api/",
  "/admin",
  "/_next",
  "/favicon",
  "/images",
  "/robots.txt",
  "/sitemap.xml",
];

/**
 * Proxy Villa R.E.E.L (Next.js 16 — anciennement middleware.ts)
 *
 * Trois responsabilités :
 * 1. Mode maintenance  — redirige le trafic public vers /maintenance
 * 2. Auth admin        — protège /admin/* sauf /admin/login
 * 3. Routage i18n      — préfixes /fr et /en via next-intl
 */
export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  /* ── 1. Fichiers statiques — bypass immédiat ──────────────────── */
  if (pathname.includes(".")) {
    return NextResponse.next();
  }

  /* ── 2. Mode maintenance ──────────────────────────────────────── */
  const isMaintenance = process.env.MAINTENANCE_MODE === "true";

  if (isMaintenance) {
    const isBypassed = MAINTENANCE_BYPASS.some((p) =>
      pathname.startsWith(p),
    );

    if (!isBypassed) {
      return NextResponse.redirect(new URL("/maintenance", req.url));
    }

    if (pathname === "/maintenance") {
      return NextResponse.next();
    }
  }

  /* ── 3. Routes API — bypass total ─────────────────────────────── */
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  /* ── 4. Page maintenance — bypass intl ───────────────────────── */
  if (pathname.startsWith("/maintenance")) {
    return NextResponse.next();
  }

  /* ── 5. Routes admin — auth + bypass intl ─────────────────────── */
  if (pathname.startsWith("/admin")) {
    /* Login accessible sans authentification */
    if (pathname.startsWith("/admin/login")) {
      return NextResponse.next();
    }

    /* Toutes les autres pages admin → vérification JWT */
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set(
        "callbackUrl",
        encodeURIComponent(pathname),
      );
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  /* ── 6. Routing i18n pour les routes publiques ─────────────────── */
  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)" ],
};
