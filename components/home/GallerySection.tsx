'use client';

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { GALLERY_PHOTOS, HOME_GALLERY_COUNT } from "@/lib/gallery";

const PHOTOS = GALLERY_PHOTOS.slice(0, HOME_GALLERY_COUNT);

export function GallerySection({ locale }: { locale: string }) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const activePhoto = PHOTOS.find((p) => p.id === activeId) ?? null;

  return (
    <section className="bg-background py-16">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Atmosphère
            </h2>
            <p className="font-display mt-2 text-2xl font-semibold text-neutral-900 md:text-3xl">
              Un aperçu de la villa
            </p>
          </div>
          <Link
            href={`/${locale}/galerie`}
            className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-neutral-800 shadow-sm transition hover:border-primary hover:text-primary"
          >
            Voir toutes les photos
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
          {PHOTOS.map((photo) => (
            <GalleryItem key={photo.id} photo={photo} onClick={setActiveId} />
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {activePhoto && (
        <button
          type="button"
          aria-label="Fermer la photo"
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
              aria-label="Fermer"
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
};

function GalleryItem({ photo, onClick }: GalleryItemProps) {
  return (
    <button
      type="button"
      aria-label={photo.alt}
      className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-neutral-200"
      onClick={() => onClick(photo.id)}
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        className="object-cover transition-transform group-hover:scale-105"
        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-70 transition group-hover:opacity-60" />
    </button>
  );
}
