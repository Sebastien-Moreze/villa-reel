/**
 * middleware.ts — Protection centralisée des routes admin.
 *
 * Intercepte toutes les requêtes vers /admin/* et /api/admin/*.
 * - Pages admin (/admin/*) : redirige vers /admin/login si non authentifié.
 * - API admin (/api/admin/*) : retourne HTTP 401 si non authentifié.
 *
 * Ce middleware s'ajoute en défense en profondeur :
 * chaque route garde également son propre requireAuth() / isAdmin().
 */

import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPage =
    pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");
  const isAdminApi = pathname.startsWith("/api/admin/");

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    if (isAdminApi) {
      // Routes API → JSON 401
      return NextResponse.json(
        { error: "Authentification requise", code: "UNAUTHORIZED" },
        { status: 401 },
      );
    }
    // Pages admin → redirection vers la page de login
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
