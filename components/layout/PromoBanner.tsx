'use client';

import { useEffect, useState } from "react";

type PromoBannerProps = {
  /** Le texte de la promo à afficher. Si vide, le bandeau n'apparaît pas. */
  message?: string;
  /** Identifiant de la promo, utilisé pour la clé de fermeture dans localStorage. */
  promoId?: string;
};

const STORAGE_KEY_BASE = "villa-reel-promo-dismissed:";

export function PromoBanner({ message, promoId }: PromoBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) return;

    const key = STORAGE_KEY_BASE + (promoId ?? "default");
    const dismissed = typeof window !== "undefined" && localStorage.getItem(key);

    if (!dismissed) {
      setVisible(true);
    }
  }, [message, promoId]);

  if (!message || !visible) {
    return null;
  }

  const handleClose = () => {
    const key = STORAGE_KEY_BASE + (promoId ?? "default");
    try {
      localStorage.setItem(key, "true");
    } catch {
      // Ignorer les erreurs de stockage (mode privé, quota, etc.)
    }
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center">
      <div className="mx-3 mt-3 flex max-w-4xl items-center gap-3 rounded-full border border-primary/40 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/5 px-4 py-2 text-xs text-neutral-800 shadow-md md:text-sm">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-cta text-[10px] font-semibold text-white">
          %
        </span>
        <p className="flex-1 font-medium">{message}</p>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Fermer la promotion"
          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-primary/30 bg-white/70 text-[10px] text-neutral-800 transition hover:bg-primary/10"
        >
          ×
        </button>
      </div>
    </div>
  );
}

