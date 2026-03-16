'use client';

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email,
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
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-lg border border-primary/40 bg-neutral-950 px-3 py-2 text-xs text-neutral-50 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
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

