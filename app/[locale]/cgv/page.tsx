import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente – Villa R.E.E.L",
  robots: { index: false },
};

type PageProps = { params: Promise<{ locale: string }> };

export default async function CGVPage({ params }: PageProps) {
  const { locale } = await params;
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <p className="text-xs uppercase tracking-[0.3em] text-primary/70">Villa R.E.E.L</p>
      <h1 className="font-display mt-2 text-3xl font-bold text-neutral-900">Conditions Générales de Vente</h1>
      <p className="mt-2 text-sm text-neutral-500">Applicables à toute réservation de la Villa R.E.E.L — en vigueur à compter de mars 2026</p>

      <div className="mt-10 space-y-10 text-sm text-neutral-700 leading-relaxed">

        {/* Article 1 */}
        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-3">Article 1 – Parties au contrat</h2>
          <p>
            Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre :
          </p>
          <div className="mt-3 rounded-xl bg-neutral-50 p-5 space-y-2 text-sm">
            <div>
              <p className="font-medium text-neutral-800">Le bailleur :</p>
              <p>R.E.E.L., société civile au capital de 1 000 €, immatriculée sous le SIRET 984 156 794 00013,
              dont le siège est situé à Reignier-Esery, Haute-Savoie, France,
              représentée par Mme Saban Estelle et M. Jedonne Rodrigue,
              ci-après dénommée « le Bailleur ».</p>
            </div>
            <div>
              <p className="font-medium text-neutral-800">Le locataire :</p>
              <p>Toute personne physique ou morale procédant à une réservation en ligne ou directement auprès du Bailleur, ci-après dénommée « le Locataire ».</p>
            </div>
          </div>
        </section>

        {/* Article 2 */}
        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-3">Article 2 – Objet</h2>
          <p>
            Les présentes CGV ont pour objet de définir les conditions dans lesquelles la Villa R.E.E.L, propriété de la société R.E.E.L., est mise en location saisonnière à usage privatif. La villa est située à Reignier-Esery, Haute-Savoie, France.
          </p>
          <p className="mt-2">
            La villa est proposée pour des séjours privés, des événements d&apos;entreprise et des collaborations. Sa capacité maximale d&apos;accueil est de 8 personnes.
          </p>
          <p className="mt-2">
            La Villa R.E.E.L est un <strong>meublé de tourisme classé</strong>. Le classement est attribué conformément aux dispositions du Code du tourisme (article L. 324-1 et suivants).
          </p>
        </section>

        {/* Article 3 */}
        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-3">Article 3 – Réservation et formation du contrat</h2>
          <p>
            La réservation est effectuée via le site internet <strong>villareel.com</strong> ou directement par email auprès du Bailleur. Elle n&apos;est définitive qu&apos;après :
          </p>
          <ul className="mt-2 ml-4 space-y-1 list-disc">
            <li>réception du formulaire de réservation dûment complété ;</li>
            <li>confirmation écrite (email) adressée par le Bailleur.</li>
          </ul>
          <p className="mt-2">
            La durée minimale de séjour est de <strong>2 nuits</strong>. Des séjours d&apos;une nuit peuvent être accordés sur demande, selon les disponibilités et à la discrétion du Bailleur. Les arrivées sont possibles <strong>tous les jours de la semaine</strong>.
          </p>
          <p className="mt-2">
            Le Locataire déclare avoir pris connaissance et accepté les présentes CGV avant toute réservation.
          </p>
        </section>

        {/* Article 4 */}
        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-3">Article 4 – Prix et modalités de paiement</h2>

          <h3 className="text-sm font-semibold text-neutral-800 mt-4 mb-2">4.1 Prix</h3>
          <p>
            Les tarifs sont indiqués en euros (€), toutes taxes comprises, sur le site villareel.com. Ils comprennent la location du bien, les charges courantes (eau, électricité, chauffage) et le ménage de fin de séjour. <strong>Aucuns frais de ménage ne sont facturés séparément.</strong> Les prestations additionnelles (chef privé, dégustation de vins, etc.) font l&apos;objet d&apos;une facturation séparée.
          </p>

          <h3 className="text-sm font-semibold text-neutral-800 mt-4 mb-2">4.2 Modalités de paiement</h3>
          <p>
            Aucun acompte n&apos;est exigé à la réservation. La <strong>totalité du montant du séjour est due au plus tard 30 jours avant la date d&apos;arrivée</strong>. À défaut de règlement dans ce délai, le Bailleur se réserve le droit d&apos;annuler la réservation.
          </p>
          <p className="mt-2">
            Pour toute réservation effectuée moins de 30 jours avant la date d&apos;arrivée, la totalité du montant est exigible immédiatement.
          </p>

          <h3 className="text-sm font-semibold text-neutral-800 mt-4 mb-2">4.3 Dépôt de garantie</h3>
          <p>
            Un dépôt de garantie de <strong>500 €</strong> est requis avant l&apos;entrée dans les lieux. Il est restitué dans un délai de <strong>7 jours ouvrés</strong> après la date de départ du Locataire, déduction faite, le cas échéant, du coût des dommages constatés lors de l&apos;état des lieux de sortie.
          </p>
        </section>

        {/* Article 5 */}
        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-3">Article 5 – Conditions d&apos;annulation</h2>

          <p className="mb-3">La politique d&apos;annulation de la Villa R.E.E.L est souple afin de vous offrir une réservation sereine :</p>

          <div className="rounded-xl overflow-hidden border border-neutral-200 mt-2">
            <table className="w-full text-xs">
              <thead className="bg-neutral-100">
                <tr>
                  <th className="text-left px-4 py-2.5 font-semibold text-neutral-700">Délai avant arrivée</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-neutral-700">Remboursement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                <tr>
                  <td className="px-4 py-2.5">Plus de 14 jours</td>
                  <td className="px-4 py-2.5 text-emerald-700 font-medium">Remboursement intégral</td>
                </tr>
                <tr className="bg-neutral-50">
                  <td className="px-4 py-2.5">Moins de 14 jours</td>
                  <td className="px-4 py-2.5 text-red-700 font-medium">Aucun remboursement</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-3">
            Toute demande d&apos;annulation doit être adressée par écrit (email) à <a href="mailto:contact@villareel.com" className="text-primary underline">contact@villareel.com</a>. La date de réception de l&apos;email fait foi.
          </p>
          <p className="mt-2">
            Le dépôt de garantie est restitué intégralement en cas d&apos;annulation, quelle que soit la date.
          </p>
        </section>

        {/* Article 6 */}
        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-3">Article 6 – Arrivée et départ</h2>
          <p>
            La mise à disposition de la villa s&apos;effectue à partir de <strong>16h00</strong> le jour d&apos;arrivée. Le Locataire s&apos;engage à libérer les lieux au plus tard à <strong>11h00</strong> le jour du départ, sauf accord écrit préalable du Bailleur. Tout dépassement non autorisé pourra faire l&apos;objet d&apos;une facturation supplémentaire.
          </p>
        </section>

        {/* Article 7 */}
        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-3">Article 7 – Obligations du locataire</h2>
          <p>Le Locataire s&apos;engage à :</p>
          <ul className="mt-2 ml-4 space-y-1 list-disc">
            <li>occuper les lieux en bon père de famille et en respecter le règlement intérieur ;</li>
            <li>ne pas sous-louer ou céder le contrat à un tiers sans accord préalable écrit ;</li>
            <li>ne pas dépasser la capacité maximale d&apos;accueil de 20 personnes ;</li>
            <li>ne pas organiser de manifestations à caractère commercial sans autorisation préalable ;</li>
            <li>respecter le voisinage et éviter toute nuisance sonore entre 22h00 et 8h00 ;</li>
            <li>restituer les lieux dans l&apos;état où il les a trouvés à son arrivée ;</li>
            <li>signaler immédiatement tout dommage ou dysfonctionnement au Bailleur.</li>
          </ul>
          <p className="mt-3 text-sm text-neutral-600">
            Le Locataire s&apos;engage également à respecter en tous points le{" "}
            <Link href={`/${locale}/reglement-interieur`} className="text-primary underline hover:text-primary/80">
              Règlement intérieur de la Villa R.E.E.L
            </Link>
            , remis lors de la réservation et consultable sur le site villareel.com.
          </p>
        </section>

        {/* Article 8 */}
        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-3">Article 8 – Responsabilité</h2>
          <p>
            Le Bailleur décline toute responsabilité en cas de vol, perte ou dommage touchant les effets personnels du Locataire ou de ses invités pendant la durée du séjour. Le Locataire est responsable de tous dommages causés à la villa, à ses équipements et à son mobilier pendant la durée de l&apos;occupation.
          </p>
          <p className="mt-2">
            Le Locataire est invité à contracter une assurance villégiature couvrant sa responsabilité civile pour la durée du séjour.
          </p>
        </section>

        {/* Article 9 */}
        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-3">Article 9 – Force majeure</h2>
          <p>
            Aucune des parties ne pourra être tenue pour responsable d&apos;un manquement à ses obligations contractuelles résultant d&apos;un événement de force majeure au sens de l&apos;article 1218 du Code civil. En cas de force majeure, les parties s&apos;efforceront de trouver une solution amiable (report du séjour, bon de remplacement).
          </p>
        </section>

        {/* Article 10 */}
        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-3">Article 10 – Droit applicable et litiges</h2>
          <p>
            Les présentes CGV sont soumises au droit français. En cas de litige, les parties s&apos;engagent à rechercher une solution amiable avant tout recours judiciaire. À défaut d&apos;accord, le litige sera soumis aux tribunaux compétents du ressort de la Cour d&apos;appel d&apos;Annecy (Haute-Savoie).
          </p>
          <p className="mt-2">
            Conformément aux dispositions du Code de la consommation, le Locataire consommateur a la possibilité de recourir gratuitement à un médiateur de la consommation.
          </p>
        </section>

        <p className="text-xs text-neutral-400 pt-4 border-t border-neutral-100">
          Dernière mise à jour : mars 2026 — R.E.E.L., société civile, SIRET 984 156 794 00013 — Meublé de tourisme classé
        </p>
      </div>
    </div>
  );
}
