'use client';

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { GALLERY_PHOTOS } from "@/lib/gallery";

export function GalerieGrid() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const total = GALLERY_PHOTOS.length;
  const activePhoto = activeIndex !== null ? GALLERY_PHOTOS[activeIndex] : null;

  const close = useCallback(() => setActiveIndex(null), []);

  const prev = useCallback(() => {
    setActiveIndex((i) => (i === null ? null : (i - 1 + total) % total));
  }, [total]);

  const next = useCallback(() => {
    setActiveIndex((i) => (i === null ? null : (i + 1) % total));
  }, [total]);

  // Keyboard navigation
  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  { e.preventDefault(); prev(); }
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      if (e.key === "Escape")     { e.preventDefault(); close(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, prev, next, close]);

  return (
    <>
      {/* ── Grid ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 md:gap-4">
        {GALLERY_PHOTOS.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            aria-label={photo.alt}
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-200"
            onClick={() => setActiveIndex(index)}
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

      {/* ── Lightbox ─────────────────────────────────────────────────── */}
      {activePhoto && activeIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activePhoto.alt}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={close}
        >
          {/* Inner container — stops propagation so clicks inside don't close */}
          <div
            className="relative flex h-full w-full max-w-5xl flex-col items-center justify-center px-14 py-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              aria-label="Fermer"
              onClick={close}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl font-light text-white backdrop-blur transition hover:bg-white/25"
            >
              ×
            </button>

            {/* Counter */}
            <p className="absolute left-0 right-0 top-4 text-center text-[11px] tracking-widest text-white/50">
              {activeIndex + 1} / {total}
            </p>

            {/* Image */}
            <div className="relative h-full w-full max-h-[75vh]">
              <Image
                src={activePhoto.src}
                alt={activePhoto.alt}
                fill
                className="rounded-xl object-contain"
                sizes="(max-width: 768px) 100vw, 900px"
                priority
              />
            </div>

            {/* Caption */}
            <p className="mt-3 text-center text-sm text-white/80">
              {activePhoto.alt}
            </p>

            {/* Prev arrow */}
            <button
              type="button"
              aria-label="Photo précédente"
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/25 active:scale-95"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>

            {/* Next arrow */}
            <button
              type="button"
              aria-label="Photo suivante"
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/25 active:scale-95"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>

          {/* Backdrop click zone (outside inner container) */}
        </div>
      )}
    </>
  );
}
