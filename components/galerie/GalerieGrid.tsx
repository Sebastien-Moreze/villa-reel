'use client';

import Image from "next/image";
import { useState } from "react";
import { GALLERY_PHOTOS } from "@/lib/gallery";

export function GalerieGrid() {
  const [activeId, setActiveId] = useState<number | null>(null);
  const activePhoto = activeId
    ? GALLERY_PHOTOS.find((p) => p.id === activeId) ?? null
    : null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 md:gap-4">
        {GALLERY_PHOTOS.map((photo) => (
          <button
            key={photo.id}
            type="button"
            aria-label={photo.alt}
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-200"
            onClick={() => setActiveId(photo.id)}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
          </button>
        ))}
      </div>

      {activePhoto && (
        <button
          type="button"
          aria-label="Fermer la photo"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setActiveId(null)}
        >
          <div
            className="relative h-full max-h-[85vh] w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={activePhoto.src}
              alt={activePhoto.alt}
              fill
              className="rounded-xl object-contain"
              sizes="(max-width: 768px) 100vw, 900px"
            />
            <p className="mt-2 text-center text-sm text-white/90">
              {activePhoto.alt}
            </p>
            <button
              type="button"
              aria-label="Fermer"
              className="absolute -right-2 top-0 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg font-semibold text-white backdrop-blur transition hover:bg-white/20 md:right-0 md:-top-12"
              onClick={() => setActiveId(null)}
            >
              ×
            </button>
          </div>
        </button>
      )}
    </>
  );
}
