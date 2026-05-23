"use client";

import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";

export default function MerciPage() {
  const searchParams = useSearchParams();
  const { locale } = useParams() as { locale: string };
  const code = searchParams.get("code");

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* En-tête */}
      <section className="bg-gradient-to-b from-primary via-primary/95 to-secondary py-12 text-white">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/80">
            Villa R.E.E.L
          </p>
          <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
            Paiement confirmé
          </h1>
        </div>
      </section>

      {/* Contenu */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-md">
          <div className="rounded-2xl bg-white p-8 shadow-sm text-center space-y-5">
            <div className="text-6xl">🎉</div>
            <h2 className="font-display text-xl font-semibold text-primary">
              Votre solde est réglé !
            </h2>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {code && (
                <>
                  Le paiement de la réservation{" "}
                  <strong className="text-neutral-800">{code}</strong> a bien
                  été enregistré.
                  <br />
                </>
              )}
              Un email de confirmation vous a été envoyé. Nous avons hâte de
              vous accueillir à la Villa R.E.E.L&nbsp;!
            </p>

            <div className="border-t pt-5">
              <Link
                href={`/${locale}`}
                className="inline-block rounded-full bg-primary px-6 py-2.5
                           text-xs font-semibold text-white shadow-md
                           hover:opacity-90 transition"
              >
                Retour à l&apos;accueil
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
