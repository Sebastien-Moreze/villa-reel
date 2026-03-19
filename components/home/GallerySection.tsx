'use client';

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { GALLERY_PHOTOS } from "@/lib/gallery";

// 3 photos sélectionnées pour mettre la villa en valeur sur l'accueil
const PHOTOS = [
  GALLERY_PHOTOS.find((p) => p.id === 1)!,  // Piscine & vue sur la maison
  GALLERY_PHOTOS.find((p) => p.id === 2)!,  // Salon panoramique
  GALLERY_PHOTOS.find((p) => p.id === 17)!, // Piscine au coucher du soleil
];

export function GallerySection({ locale }: { locale: string }) {
  const t = useTranslations();
  const [activeId, setActiveId] = useState<number | null>(null);
  const activePhoto = PHOTOS.find((p) => p.id === activeId) ?? null;

  return (
    <section className="bg-background py-16">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              {t("gallery.eyebrow")}
            </h2>
            <p className="font-display mt-2 text-2xl font-semibold text-neutral-900 md:text-3xl">
              {t("gallery.title")}
            </p>
          </div>
          <Link
            href={`/${locale}/galerie`}
            className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-neutral-800 shadow-sm transition hover:border-primary hover:text-primary"
          >
            {t("gallery.viewAll")}
          </Link>
        </div>

        {/* Layout éditorial : 1 grande photo + 2 empilées */}
        <div className="mt-8 grid h-[420px] grid-cols-3 gap-3 md:h-[500px] md:gap-4">
          {/* Grande photo à gauche */}
          <div className="col-span-2">
            <GalleryItem photo={PHOTOS[0]} onClick={setActiveId} className="h-full" />
          </div>
          {/* 2 photos empilées à droite */}
          <div className="flex flex-col gap-3 md:gap-4">
            <GalleryItem photo={PHOTOS[1]} onClick={setActiveId} className="flex-1" />
            <GalleryItem photo={PHOTOS[2]} onClick={setActiveId} className="flex-1" />
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {activePhoto && (
        <button
          type="button"
          aria-label={t("gallery.closePhoto")}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setActiveId(null)}
        >
          <div
            className="relative h-full max-h-[80vh] w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={activePhoto.src}
              alt={activePhoto.alt}
              fill
              className="rounded-xl object-contain"
              sizes="(max-width: 768px) 100vw, 800px"
            />
            <button
              type="button"
              aria-label={t("gallery.close")}
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-xs font-semibold text-white"
              onClick={() => setActiveId(null)}
            >
              ×
            </button>
          </div>
        </button>
      )}
    </section>
  );
}

type GalleryItemProps = {
  photo: { id: number; src: string; alt: string };
  onClick: (id: number) => void;
  className?: string;
};

function GalleryItem({ photo, onClick, className = "" }: GalleryItemProps) {
  return (
    <button
      type="button"
      aria-label={photo.alt}
      className={`group relative w-full overflow-hidden rounded-2xl bg-neutral-200 ${className}`}
      onClick={() => onClick(photo.id)}
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 768px) 66vw, 50vw"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 transition group-hover:opacity-40" />
      {/* Caption au survol */}
      <span className="absolute bottom-3 left-3 right-3 text-left text-[11px] font-medium text-white/0 transition-all group-hover:text-white/90">
        {photo.alt}
      </span>
    </button>
  );
}
