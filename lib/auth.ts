import { NextAuthOptions, getServerSession } from "next-auth";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

type AdminRole = "SUPER_ADMIN" | "MANAGER";

type AppUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: AdminRole | string;
};

type AppJWT = JWT & {
  role?: AdminRole | string;
};

/* ── Validation Zod des credentials ─────────────────────────────
   Validée AVANT le hit DB pour éviter les requêtes avec des
   données malformées (injection, payloads trop longs, etc.).     */
const credentialsSchema = z.object({
  email: z
    .string()
    .email("Email invalide")
    .max(255, "Email trop long")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(6, "Mot de passe trop court")
    .max(128, "Mot de passe trop long"),
});

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    /* Expire après 8h d'inactivité */
    maxAge: 8 * 60 * 60,
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<AppUser | null> {
        /* ── 1. Validation Zod (avant toute requête DB) ──────── */
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        /* ── 2. Recherche de l'admin en DB ───────────────────── */
        const admin = await prisma.adminUser.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            hashedPassword: true,
          },
        });

        if (!admin) {
          /* Délai constant pour éviter le timing attack (user enum) */
          await bcrypt.compare(password, "$2b$12$invalid.hash.for.timing");
          return null;
        }

        /* ── 3. Vérification bcrypt ───────────────────────────── */
        const valid = await bcrypt.compare(password, admin.hashedPassword);
        if (!valid) return null;

        return {
          id: String(admin.id),
          email: admin.email,
          name: admin.name ?? "Admin",
          role: admin.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({
      token,
      user,
    }: {
      token: AppJWT;
      user?: AppUser | null;
    }): Promise<AppJWT> {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: Session;
      token: AppJWT;
    }): Promise<Session> {
      if (session.user) {
        const appUser = session.user as AppUser;
        appUser.id = token.sub ?? appUser.id;
        appUser.role = token.role ?? appUser.role;
      }
      return session;
    },
  },
  /* Force HTTPS pour le cookie en production */
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};

export async function getCurrentUser(): Promise<AppUser | null> {
  const session = await getServerSession(authOptions);
  return (session?.user as AppUser | undefined) ?? null;
}

export async function isAdmin() {
  const user = await getCurrentUser();
  const role = user?.role;
  return role === "SUPER_ADMIN" || role === "MANAGER";
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }
  return user;
}
