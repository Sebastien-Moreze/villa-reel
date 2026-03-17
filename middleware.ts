import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import createIntlMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n";

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
});

const ADMIN_PREFIX = "/admin";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Routes API : bypass total (NextAuth, webhooks, etc.) ─────────────────
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // ── Routes admin : bypass total du middleware i18n ────────────────────────
  if (pathname.startsWith(ADMIN_PREFIX)) {
    // Page de login : accessible sans token
    if (pathname.startsWith(`${ADMIN_PREFIX}/login`)) {
      return NextResponse.next();
    }

    // Toutes les autres pages admin : vérification du token
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // ── Redirection racine -> /fr ─────────────────────────────────────────────
  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, req.url));
  }

  // ── Internationalisation pour toutes les routes publiques ─────────────────
  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"]
};

