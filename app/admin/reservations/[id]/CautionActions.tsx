'use client';

import { useState } from "react";

type Props = {
  reservationId: number;
  cautionAmount: number;
};

export function CautionActions({ reservationId, cautionAmount }: Props) {
  const [loading, setLoading] = useState<"capture" | "release" | null>(null);
  const [done, setDone] = useState<"captured" | "released" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const call = async (action: "capture" | "release") => {
    setLoading(action);
    setError(null);
    try {
      const res = await fetch(`/api/admin/caution/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationId }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Une erreur est survenue.");
      } else {
        setDone(action === "capture" ? "captured" : "released");
        // Rechargement de la page pour rafraîchir les données Server Component
        window.location.reload();
      }
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setLoading(null);
    }
  };

  if (done) {
    return (
      <div className="rounded-lg border border-emerald-800 bg-emerald-950 px-3 py-2 text-[11px] text-emerald-300">
        {done === "captured"
          ? "✓ Caution encaissée avec succès."
          : "✓ Caution libérée avec succès."}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {/* Capturer */}
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => call("capture")}
          className="flex items-center gap-1.5 rounded-full bg-cta px-4 py-1.5 text-[11px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === "capture" ? (
            <>
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Encaissement...
            </>
          ) : (
            <>⚡ Encaisser {cautionAmount.toLocaleString("fr-FR")} €</>
          )}
        </button>

        {/* Libérer */}
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => call("release")}
          className="flex items-center gap-1.5 rounded-full border border-emerald-700 px-4 py-1.5 text-[11px] font-semibold text-emerald-300 transition hover:bg-emerald-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === "release" ? (
            <>
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-300 border-t-transparent" />
              Libération...
            </>
          ) : (
            <>✓ Libérer la caution</>
          )}
        </button>
      </div>

      {error && (
        <p className="rounded-lg border border-red-800 bg-red-950 px-3 py-1.5 text-[10px] text-red-300">
          ⚠ {error}
        </p>
      )}
    </div>
  );
}
