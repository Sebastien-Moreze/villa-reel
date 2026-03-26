'use client';

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

/* ── Guard contre les open redirects ─────────────────────────────
   Seules les URLs internes (commençant par /) sont autorisées.
   Toute URL externe est ignorée → fallback /admin/dashboard.       */
function sanitizeCallbackUrl(raw: string | null): string {
  if (!raw) return "/admin/dashboard";
  try {
    const decoded = decodeURIComponent(raw);
    /* N'autoriser que les chemins internes */
    if (decoded.startsWith("/") && !decoded.startsWith("//")) {
      return decoded;
    }
  } catch {
    /* decodeURIComponent peut throw si malformé */
  }
  return "/admin/dashboard";
}

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = sanitizeCallbackUrl(searchParams.get("callbackUrl"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Identifiants invalides.");
      return;
    }
    router.push(callbackUrl);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-950 via-primary/30 to-black px-4">
      <div className="w-full max-w-sm rounded-2xl border border-primary/30 bg-neutral-950/80 p-6 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="inline-flex flex-col items-center gap-1">
            <span className="text-[10px] font-semibold tracking-[0.35em] text-primary">
              VILLA
            </span>
            <span className="text-xs font-semibold tracking-[0.4em] text-secondary">
              R.E.E.L
            </span>
          </div>
          <p className="mt-4 text-sm font-semibold text-neutral-50">
            Interface administrateur
          </p>
          <p className="mt-1 text-[11px] text-neutral-400">
            Connectez-vous pour gérer la villa, les réservations et les
            contenus.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="email"
              className="text-[11px] font-semibold text-neutral-300"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={255}
              className="rounded-lg border border-primary/40 bg-neutral-950 px-3 py-2 text-xs text-neutral-50 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="password"
              className="text-[11px] font-semibold text-neutral-300"
            >
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                maxLength={128}
                className="w-full rounded-lg border border-primary/40 bg-neutral-950 px-3 py-2 pr-10 text-xs text-neutral-50 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 transition hover:text-neutral-200"
                tabIndex={-1}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="button"
            disabled
            className="inline-flex w-full items-center justify-center rounded-full border border-neutral-700 bg-neutral-900 px-3 py-2 text-[11px] font-semibold text-neutral-400"
          >
            2FA (bientôt disponible)
          </button>

          {error && (
            <p className="text-[11px] font-semibold text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2.5 text-[11px] font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
