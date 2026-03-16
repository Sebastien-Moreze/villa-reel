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

  // Internationalisation pour toutes les routes publiques
  const res = intlMiddleware(req);

  // Redirection racine -> /fr
  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, req.url));
  }

  // Admin sans locale (chemin distinct)
  if (pathname.startsWith(`${ADMIN_PREFIX}/login`)) {
    return res;
  }

  if (pathname.startsWith(ADMIN_PREFIX)) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirection /villa-reel -> /fr/villa-reel
  if (pathname === "/villa-reel") {
    return NextResponse.redirect(new URL(`/${defaultLocale}/villa-reel`, req.url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"]
};

