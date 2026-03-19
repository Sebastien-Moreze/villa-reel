import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      {/* Grande typo 404 */}
      <p className="font-display text-[120px] font-bold leading-none text-primary/10 select-none md:text-[160px]">
        404
      </p>

      <div className="-mt-6">
        <p className="text-xs uppercase tracking-[0.3em] text-primary/60">Villa R.E.E.L</p>
        <h1 className="font-display mt-2 text-2xl font-bold text-neutral-900 md:text-3xl">
          Page introuvable
        </h1>
        <p className="mt-3 max-w-md text-sm text-neutral-500">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
          Voici quelques liens qui pourraient vous aider.
        </p>
      </div>

      {/* Liens utiles */}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/fr"
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:opacity-90 transition"
        >
          Accueil
        </Link>
        <Link
          href="/fr/villa"
          className="rounded-full border border-neutral-300 bg-white px-6 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition"
        >
          La Villa
        </Link>
        <Link
          href="/fr/galerie"
          className="rounded-full border border-neutral-300 bg-white px-6 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition"
        >
          Galerie
        </Link>
        <Link
          href="/fr/contact"
          className="rounded-full border border-neutral-300 bg-white px-6 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition"
        >
          Contact
        </Link>
      </div>
    </div>
  );
}
