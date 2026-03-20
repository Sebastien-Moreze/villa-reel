"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  token: string;
  locale: string;
};

const CRITERIA = [
  { key: "rating", labelFr: "Note globale", labelEn: "Overall rating" },
  { key: "ratingCleanliness", labelFr: "Propreté", labelEn: "Cleanliness" },
  { key: "ratingComfort", labelFr: "Confort", labelEn: "Comfort" },
  { key: "ratingLocation", labelFr: "Emplacement", labelEn: "Location" },
  { key: "ratingCommunication", labelFr: "Communication", labelEn: "Communication" },
] as const;

type Ratings = Record<(typeof CRITERIA)[number]["key"], number>;

export function ReviewForm({ token, locale }: Props) {
  const isFr = locale === "fr";

  const [ratings, setRatings] = useState<Ratings>({
    rating: 0,
    ratingCleanliness: 0,
    ratingComfort: 0,
    ratingLocation: 0,
    ratingCommunication: 0,
  });
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const allRated = Object.values(ratings).every((v) => v >= 1);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allRated) return;

    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          ...ratings,
          comment: comment.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur inconnue");
      }

      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Erreur serveur");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="mt-12 rounded-2xl bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl">
          ✓
        </div>
        <h2 className="text-lg font-semibold text-neutral-900">
          {isFr ? "Merci pour votre avis !" : "Thank you for your review!"}
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          {isFr
            ? "Votre avis sera publié après vérification par notre équipe."
            : "Your review will be published after verification by our team."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 space-y-6">
      {/* Critères de notation */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-neutral-900">
          {isFr ? "Vos notes" : "Your ratings"}
        </h2>
        <div className="space-y-4">
          {CRITERIA.map(({ key, labelFr, labelEn }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-neutral-700">
                {isFr ? labelFr : labelEn}
              </span>
              <StarInput
                value={ratings[key]}
                onChange={(v) => setRatings((prev) => ({ ...prev, [key]: v }))}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Commentaire */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <label htmlFor="comment" className="mb-2 block text-sm font-semibold text-neutral-900">
          {isFr ? "Votre commentaire (optionnel)" : "Your comment (optional)"}
        </label>
        <textarea
          id="comment"
          rows={5}
          maxLength={2000}
          className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder={
            isFr
              ? "Partagez votre expérience à la Villa R.E.E.L…"
              : "Share your experience at Villa R.E.E.L…"
          }
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <p className="mt-1 text-right text-[11px] text-neutral-400">
          {comment.length}/2000
        </p>
      </div>

      {/* Erreur */}
      {status === "error" && (
        <p className="text-center text-sm text-red-600">{errorMsg}</p>
      )}

      {/* Bouton */}
      <button
        type="submit"
        disabled={!allRated || status === "submitting"}
        className={cn(
          "w-full rounded-full px-6 py-3 text-sm font-semibold text-white shadow-md transition",
          allRated
            ? "bg-primary hover:opacity-90"
            : "cursor-not-allowed bg-neutral-300",
        )}
      >
        {status === "submitting"
          ? isFr
            ? "Envoi en cours…"
            : "Submitting…"
          : isFr
            ? "Envoyer mon avis"
            : "Submit my review"}
      </button>
    </form>
  );
}

/* ── Composant étoiles cliquables ──────────────────────────────────── */

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={cn(
            "text-lg transition",
            star <= (hover || value) ? "text-yellow-400" : "text-neutral-300",
          )}
          onMouseEnter={() => setHover(star)}
          onClick={() => onChange(star)}
          aria-label={`${star}/5`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
