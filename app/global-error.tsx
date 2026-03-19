"use client";

import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * global-error.tsx — Remplace le layout entier en cas d'erreur critique.
 * Doit inclure <html> et <body> car il remplace le layout racine.
 */
export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[GlobalError]", error.message, error.digest);
  }, [error]);

  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#fafafa" }}>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "2rem",
          textAlign: "center",
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "rgba(99,60,43,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: "1.5rem",
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
              fill="none" stroke="#633C2B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            </svg>
          </div>

          <p style={{ fontSize: "0.7rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#999", margin: 0 }}>
            Villa R.E.E.L
          </p>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#111", marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            Erreur critique
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#666", maxWidth: 400, lineHeight: 1.6, margin: "0 auto" }}>
            Le site a rencontré une erreur inattendue. Nos équipes en ont été informées.
            Veuillez réessayer ou revenir plus tard.
          </p>

          {error.digest && (
            <p style={{ marginTop: "0.75rem", fontSize: "0.65rem", color: "#aaa", fontFamily: "monospace" }}>
              Réf. : {error.digest}
            </p>
          )}

          <div style={{ marginTop: "2rem", display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                background: "#633C2B", color: "#fff", border: "none",
                borderRadius: "9999px", padding: "0.625rem 1.5rem",
                fontSize: "0.875rem", fontWeight: 600, cursor: "pointer",
              }}
            >
              Réessayer
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                background: "#fff", color: "#374151", border: "1px solid #d1d5db",
                borderRadius: "9999px", padding: "0.625rem 1.5rem",
                fontSize: "0.875rem", fontWeight: 600, textDecoration: "none",
              }}
            >
              Retour à l&apos;accueil
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
