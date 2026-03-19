"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/* ── Config par type d'erreur ─────────────────────────────────────────── */

type ErrorConfig = {
  status: number;
  title: string;
  message: string;
  showReset: boolean;
  accent: string;       // couleur Tailwind pour l'icône / badge
  icon: "warning" | "lock" | "clock" | "server" | "wrench";
};

const ERROR_MAP: Record<string, ErrorConfig> = {
  BadRequestError: {
    status: 400,
    title: "Requête invalide",
    message: "Les informations envoyées sont incorrectes ou incomplètes. Vérifiez les données saisies et réessayez.",
    showReset: true,
    accent: "text-amber-600 bg-amber-50",
    icon: "warning",
  },
  UnauthorizedError: {
    status: 401,
    title: "Connexion requise",
    message: "Vous devez être connecté pour accéder à cette page. Veuillez vous authentifier.",
    showReset: false,
    accent: "text-blue-600 bg-blue-50",
    icon: "lock",
  },
  ForbiddenError: {
    status: 403,
    title: "Accès refusé",
    message: "Vous n'avez pas les droits nécessaires pour accéder à cette ressource.",
    showReset: false,
    accent: "text-red-600 bg-red-50",
    icon: "lock",
  },
  TooManyRequestsError: {
    status: 429,
    title: "Trop de tentatives",
    message: "Vous avez effectué trop de requêtes en peu de temps. Attendez quelques instants avant de réessayer.",
    showReset: true,
    accent: "text-orange-600 bg-orange-50",
    icon: "clock",
  },
  ServiceUnavailableError: {
    status: 503,
    title: "Service indisponible",
    message: "Le site est temporairement en maintenance. Nous reviendrons très vite — merci de votre patience.",
    showReset: false,
    accent: "text-purple-600 bg-purple-50",
    icon: "wrench",
  },
};

const DEFAULT_CONFIG: ErrorConfig = {
  status: 500,
  title: "Erreur serveur",
  message: "Une erreur inattendue s'est produite de notre côté. Notre équipe en a été informée automatiquement. Vous pouvez réessayer ou revenir à l'accueil.",
  showReset: true,
  accent: "text-primary bg-primary/10",
  icon: "server",
};

/* ── Icônes SVG ───────────────────────────────────────────────────────── */

function Icon({ name }: { name: ErrorConfig["icon"] }) {
  if (name === "lock") return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      className="h-8 w-8">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
  if (name === "clock") return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      className="h-8 w-8">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
  if (name === "server") return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      className="h-8 w-8">
      <rect width="20" height="8" x="2" y="2" rx="2" ry="2"/>
      <rect width="20" height="8" x="2" y="14" rx="2" ry="2"/>
      <line x1="6" x2="6.01" y1="6" y2="6"/>
      <line x1="6" x2="6.01" y1="18" y2="18"/>
    </svg>
  );
  if (name === "wrench") return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      className="h-8 w-8">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  );
  // warning (default)
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      className="h-8 w-8">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" x2="12" y1="9" y2="13"/>
      <line x1="12" x2="12.01" y1="17" y2="17"/>
    </svg>
  );
}

/* ── Composant principal ──────────────────────────────────────────────── */

export default function LocaleError({ error, reset }: Props) {
  const params = useParams();
  const locale = (params?.locale as string) ?? "fr";

  const config = ERROR_MAP[error.name] ?? DEFAULT_CONFIG;

  useEffect(() => {
    console.error("[Error]", {
      name:    error.name,
      message: error.message,
      digest:  error.digest,
      status:  config.status,
    });
  }, [error, config.status]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">

      {/* Icône */}
      <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-full ${config.accent}`}>
        <Icon name={config.icon} />
      </div>

      {/* Badge statut HTTP */}
      <span className={`inline-block rounded-full px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${config.accent}`}>
        Erreur {config.status}
      </span>

      <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-neutral-400">Villa R.E.E.L</p>

      <h1 className="font-display mt-1 text-2xl font-bold text-neutral-900 md:text-3xl">
        {config.title}
      </h1>

      <p className="mt-3 max-w-md text-sm text-neutral-500 leading-relaxed">
        {config.message}
      </p>

      {/* Référence pour le support */}
      {error.digest && (
        <p className="mt-3 rounded-md bg-neutral-100 px-3 py-1 font-mono text-[10px] text-neutral-400">
          Réf. support : {error.digest}
        </p>
      )}

      {/* Actions */}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {config.showReset && (
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:opacity-90 transition"
          >
            Réessayer
          </button>
        )}
        <Link
          href={`/${locale}`}
          className="rounded-full border border-neutral-300 bg-white px-6 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition"
        >
          Retour à l&apos;accueil
        </Link>
        <Link
          href={`/${locale}/contact`}
          className="rounded-full border border-neutral-200 bg-white px-6 py-2.5 text-sm font-medium text-neutral-500 hover:bg-neutral-50 transition"
        >
          Contacter le support
        </Link>
      </div>

      {/* Aide contextuelle selon le type */}
      {config.status === 503 && (
        <p className="mt-6 text-xs text-neutral-400">
          Suivez l&apos;avancement sur{" "}
          <a href="mailto:contact@villareel.com" className="underline hover:text-primary transition">
            contact@villareel.com
          </a>
        </p>
      )}
    </div>
  );
}
