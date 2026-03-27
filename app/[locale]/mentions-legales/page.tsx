import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales – Villa R.E.E.L",
  robots: { index: false },
};

type PageProps = { params: Promise<{ locale: string }> };

export default async function MentionsLegalesPage({ params }: PageProps) {
  const { locale } = await params;
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <p className="text-xs uppercase tracking-[0.3em] text-primary/70">Villa R.E.E.L</p>
      <h1 className="font-display mt-2 text-3xl font-bold text-neutral-900">Mentions légales</h1>
      <p className="mt-2 text-sm text-neutral-500">Conformément à la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l&apos;économie numérique (LCEN)</p>

      <div className="mt-10 space-y-10 text-sm text-neutral-700 leading-relaxed">

        {/* 1. Éditeur */}
        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-3">1. Éditeur du site</h2>
          <div className="rounded-xl bg-neutral-50 p-5 space-y-1.5 text-sm">
            <p><span className="font-medium text-neutral-800">Dénomination sociale :</span> R.E.E.L.</p>
            <p><span className="font-medium text-neutral-800">Forme juridique :</span> Société civile</p>
            <p><span className="font-medium text-neutral-800">Capital social :</span> 1 000,00 € (fixe)</p>
            <p><span className="font-medium text-neutral-800">SIREN :</span> 984 156 794</p>
            <p><span className="font-medium text-neutral-800">SIRET (siège) :</span> 984 156 794 00013</p>
            <p><span className="font-medium text-neutral-800">Code NAF/APE :</span> 68.10Z – Activités des marchands de biens immobiliers</p>
            <p><span className="font-medium text-neutral-800">Date de création :</span> 25 janvier 2024</p>
            <p><span className="font-medium text-neutral-800">Siège social :</span> Reignier-Esery, Haute-Savoie, France</p>
            <p><span className="font-medium text-neutral-800">Dirigeants :</span> Mme Saban Estelle et M. Jedonne Rodrigue</p>
            <p><span className="font-medium text-neutral-800">Contact :</span> <a href="mailto:contact@villareel.com" className="text-primary underline">contact@villareel.com</a> — <a href="tel:+33688423052" className="text-primary">06 88 42 30 52</a> / <a href="tel:+33680215157" className="text-primary">06 80 21 51 57</a></p>
          </div>
        </section>

        {/* 2. Hébergeur */}
        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-3">2. Hébergeur</h2>
          <div className="rounded-xl bg-neutral-50 p-5 space-y-1.5 text-sm">
            <p><span className="font-medium text-neutral-800">Société :</span> O2Switch SAS</p>
            <p><span className="font-medium text-neutral-800">Adresse :</span> Chemin des Pardiaux, 63000 Clermont-Ferrand, France</p>
            <p><span className="font-medium text-neutral-800">Téléphone :</span> 04 44 44 60 40</p>
            <p><span className="font-medium text-neutral-800">Site :</span> <a href="https://www.o2switch.fr" target="_blank" rel="noreferrer" className="text-primary underline">o2switch.fr</a></p>
          </div>
        </section>

        {/* 3. Conception & développement */}
        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-3">3. Conception & développement</h2>
          <div className="rounded-xl bg-neutral-50 p-5 space-y-1.5 text-sm">
            <p><span className="font-medium text-neutral-800">Réalisé par :</span>{" "}
              <a href="https://saanesu.com" target="_blank" rel="noreferrer" className="text-primary underline font-medium">
                saanesu
              </a>
            </p>
          </div>
        </section>

        {/* 3. Propriété intellectuelle */}
        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-3">3. Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble du contenu de ce site (textes, photographies, vidéos, logos, illustrations, architecture de la page) est la propriété exclusive de la société R.E.E.L. ou de ses partenaires, et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.
          </p>
          <p className="mt-2">
            Toute reproduction, représentation, modification, publication, adaptation ou exploitation de tout ou partie des éléments du site, sans l&apos;accord préalable écrit de R.E.E.L., est strictement interdite.
          </p>
        </section>

        {/* 4. Responsabilité */}
        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-3">4. Limitation de responsabilité</h2>
          <p>
            R.E.E.L s&apos;efforce de maintenir les informations publiées sur ce site aussi précises et à jour que possible. Toutefois, la société ne peut garantir l&apos;exactitude, la complétude ou l&apos;actualité de ces informations. R.E.E.L décline toute responsabilité pour tout préjudice direct ou indirect résultant de l&apos;utilisation du site.
          </p>
          <p className="mt-2">
            Des liens vers des sites tiers peuvent être présents sur ce site. R.E.E.L n&apos;exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
          </p>
        </section>

        {/* 5. Droit applicable */}
        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-3">5. Droit applicable et juridiction</h2>
          <p>
            Les présentes mentions légales sont régies par le droit français. En cas de litige relatif à l&apos;utilisation du site, les tribunaux français seront seuls compétents.
          </p>
        </section>

        {/* 6. Cookies */}
        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-3">6. Cookies</h2>
          <p>
            Ce site est susceptible d&apos;utiliser des cookies techniques nécessaires à son fonctionnement. Aucun cookie publicitaire ou de traçage tiers n&apos;est utilisé sans votre consentement. Pour en savoir plus, consultez notre{" "}
            <a href={`/${locale}/confidentialite`} className="text-primary underline">politique de confidentialité</a>.
          </p>
        </section>

        <p className="text-xs text-neutral-400 pt-4 border-t border-neutral-100">
          Dernière mise à jour : mars 2026
        </p>
      </div>
    </div>
  );
}
