import { NextAuthOptions, getServerSession } from "next-auth";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
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

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<AppUser | null> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const admin = await prisma.adminUser.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!admin) return null;

        const valid = await bcrypt.compare(
          credentials.password,
          admin.hashedPassword,
        );
        if (!valid) return null;

        const user: AppUser = {
          id: String(admin.id),
          email: admin.email,
          name: admin.name ?? "Admin",
          role: admin.role,
        };
        return user;
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

