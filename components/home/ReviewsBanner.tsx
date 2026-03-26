'use client';

import { useTranslations } from "next-intl";

type ReviewCard = {
  id: number;
  guestName: string;
  rating: number;
  comment: string | null;
};

type Props = {
  reviews: ReviewCard[];
};

export function ReviewsBanner({ reviews }: Props) {
  const t = useTranslations();

  /* Note moyenne dynamique — fallback 5.0 si aucun avis */
  const score =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 5.0;

  const filledStars = Math.round(score);

  return (
    <section className="bg-gradient-to-r from-primary via-secondary to-primary py-14 text-white">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
              {t("reviews.eyebrow")}
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-3xl font-semibold">{score.toFixed(1)}</span>
              <span className="text-lg" role="img" aria-label={`${score.toFixed(1)} ${t("reviews.starsOutOf5")}`}>{"★".repeat(filledStars)}{"☆".repeat(5 - filledStars)}</span>
            </div>
            <p className="mt-1 text-xs text-white/90">
              {t("reviews.subtitle")}
            </p>
          </div>
        </div>

        {reviews.length > 0 && (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {reviews.slice(0, 3).map((review) => (
              <article
                key={review.id}
                className="flex h-full flex-col rounded-2xl bg-white/10 p-4 text-xs text-white/95 backdrop-blur-sm"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="font-semibold">
                    {review.guestName || t("reviews.guest")}
                  </div>
                  <div className="text-[11px] text-white/90" role="img" aria-label={`${review.rating.toFixed(1)} / 5`}>
                    {review.rating.toFixed(1)} ★
                  </div>
                </div>
                <p className="text-[11px] leading-relaxed text-white/80 line-clamp-4">
                  {review.comment ?? t("reviews.defaultComment")}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

