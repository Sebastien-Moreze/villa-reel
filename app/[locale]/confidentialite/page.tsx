import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité – Villa R.E.E.L",
  robots: { index: false },
};

type PageProps = { params: Promise<{ locale: string }> };

export default async function ConfidentialitePage({ params }: PageProps) {
  const { locale } = await params;
  void locale;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <p className="text-xs uppercase tracking-[0.3em] text-primary/70">Villa R.E.E.L</p>
      <h1 className="font-display mt-2 text-3xl font-bold text-neutral-900">Politique de confidentialité</h1>
      <p className="mt-2 text-sm text-neutral-500">Conformément au Règlement Général sur la Protection des Données (RGPD) – UE 2016/679</p>

      <div className="mt-10 space-y-10 text-sm text-neutral-700 leading-relaxed">

        {/* Article 1 */}
        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-3">1. Responsable du traitement</h2>
          <div className="rounded-xl bg-neutral-50 p-5 space-y-1.5 text-sm">
            <p><span className="font-medium text-neutral-800">Société :</span> R.E.E.L.</p>
            <p><span className="font-medium text-neutral-800">SIRET :</span> 984 156 794 00013</p>
            <p><span className="font-medium text-neutral-800">Adresse :</span> 1281 Route de Moussy, 74930 Reignier-Esery, France</p>
            <p><span className="font-medium text-neutral-800">Contact DPO / responsable :</span> <a href="mailto:contact@villareel.com" className="text-primary underline">contact@villareel.com</a></p>
          </div>
        </section>

        {/* Article 2 */}
        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-3">2. Données collectées</h2>
          <p>Dans le cadre de l&apos;utilisation du site <strong>villareel.com</strong> et du processus de réservation, nous collectons les données suivantes :</p>

          <div className="mt-3 rounded-xl overflow-hidden border border-neutral-200">
            <table className="w-full text-xs">
              <thead className="bg-neutral-100">
                <tr>
                  <th className="text-left px-4 py-2.5 font-semibold text-neutral-700">Donnée</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-neutral-700">Finalité</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-neutral-700">Base légale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                <tr>
                  <td className="px-4 py-2.5">Nom, prénom</td>
                  <td className="px-4 py-2.5">Gestion de la réservation</td>
                  <td className="px-4 py-2.5">Exécution du contrat</td>
                </tr>
                <tr className="bg-neutral-50">
                  <td className="px-4 py-2.5">Adresse email</td>
                  <td className="px-4 py-2.5">Confirmation, communication</td>
                  <td className="px-4 py-2.5">Exécution du contrat</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5">Numéro de téléphone</td>
                  <td className="px-4 py-2.5">Contact en cas d&apos;urgence</td>
                  <td className="px-4 py-2.5">Intérêt légitime</td>
                </tr>
                <tr className="bg-neutral-50">
                  <td className="px-4 py-2.5">Données de paiement</td>
                  <td className="px-4 py-2.5">Traitement de la transaction</td>
                  <td className="px-4 py-2.5">Exécution du contrat</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5">Données de navigation (IP, cookies)</td>
                  <td className="px-4 py-2.5">Fonctionnement du site</td>
                  <td className="px-4 py-2.5">Intérêt légitime / consentement</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3">Nous ne collectons aucune donnée sensible au sens de l&apos;article 9 du RGPD (données de santé, origines ethniques, opinions politiques, etc.).</p>
        </section>

        {/* Article 3 */}
        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-3">3. Destinataires des données</h2>
          <p>Vos données sont traitées par R.E.E.L. et, dans la stricte mesure nécessaire à leur mission, par les sous-traitants suivants :</p>
          <ul className="mt-2 ml-4 space-y-1 list-disc">
            <li><strong>Stripe Inc.</strong> – traitement des paiements en ligne (siège : San Francisco, CA, USA — certifié PCI-DSS)</li>
            <li><strong>Resend Inc.</strong> – envoi des emails transactionnels (confirmations de réservation)</li>
            <li><strong>Vercel Inc.</strong> – hébergement du site web</li>
          </ul>
          <p className="mt-2">
            Ces sous-traitants sont soumis à des obligations contractuelles de confidentialité et de sécurité conformes au RGPD. Aucune donnée n&apos;est vendue ou cédée à des tiers à des fins commerciales.
          </p>
        </section>

        {/* Article 4 */}
        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-3">4. Durée de conservation</h2>
          <ul className="ml-4 space-y-1 list-disc">
            <li><strong>Données de réservation :</strong> 5 ans à compter de la fin du séjour (obligation comptable)</li>
            <li><strong>Données de contact (formulaire) :</strong> 3 ans à compter du dernier contact</li>
            <li><strong>Données de paiement :</strong> conservées par Stripe conformément à leurs obligations légales</li>
            <li><strong>Cookies techniques :</strong> 13 mois maximum</li>
          </ul>
        </section>

        {/* Article 5 */}
        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-3">5. Vos droits</h2>
          <p>Conformément au RGPD, vous disposez des droits suivants concernant vos données personnelles :</p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { title: "Droit d'accès", desc: "Obtenir une copie de vos données" },
              { title: "Droit de rectification", desc: "Corriger des données inexactes" },
              { title: "Droit à l'effacement", desc: "Demander la suppression" },
              { title: "Droit d'opposition", desc: "Vous opposer au traitement" },
              { title: "Droit à la portabilité", desc: "Recevoir vos données dans un format structuré" },
              { title: "Droit de limitation", desc: "Limiter le traitement dans certains cas" },
            ].map((r) => (
              <div key={r.title} className="rounded-lg bg-neutral-50 p-3">
                <p className="text-xs font-semibold text-neutral-800">{r.title}</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">{r.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-4">
            Pour exercer ces droits, adressez votre demande par email à{" "}
            <span className="text-amber-700">[EMAIL À COMPLÉTER]</span> en joignant une copie de votre pièce d&apos;identité.
            Nous vous répondrons dans un délai maximum de <strong>30 jours</strong>.
          </p>
          <p className="mt-2">
            Vous avez également le droit d&apos;introduire une réclamation auprès de la{" "}
            <a href="https://www.cnil.fr" target="_blank" rel="noreferrer" className="text-primary underline">
              CNIL (Commission Nationale de l&apos;Informatique et des Libertés)
            </a>.
          </p>
        </section>

        {/* Article 6 */}
        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-3">6. Cookies</h2>
          <p>Le site villareel.com utilise uniquement des <strong>cookies techniques essentiels</strong> au fonctionnement du site (session utilisateur, panier de réservation). Aucun cookie publicitaire ou de suivi comportemental tiers n&apos;est déposé.</p>
          <div className="mt-3 rounded-xl overflow-hidden border border-neutral-200">
            <table className="w-full text-xs">
              <thead className="bg-neutral-100">
                <tr>
                  <th className="text-left px-4 py-2.5 font-semibold text-neutral-700">Cookie</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-neutral-700">Finalité</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-neutral-700">Durée</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                <tr>
                  <td className="px-4 py-2.5 font-mono">__stripe_*</td>
                  <td className="px-4 py-2.5">Sécurité des paiements (Stripe)</td>
                  <td className="px-4 py-2.5">Session</td>
                </tr>
                <tr className="bg-neutral-50">
                  <td className="px-4 py-2.5 font-mono">next-intl-locale</td>
                  <td className="px-4 py-2.5">Mémorisation de la langue choisie</td>
                  <td className="px-4 py-2.5">1 an</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Article 7 */}
        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-3">7. Sécurité</h2>
          <p>
            R.E.E.L. met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, modification, divulgation ou destruction. Le site utilise le protocole HTTPS (TLS) pour toutes les communications. Les données de paiement sont traitées directement par Stripe et ne transitent jamais sur nos serveurs.
          </p>
        </section>

        {/* Article 8 */}
        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-3">8. Transferts hors UE</h2>
          <p>
            Certains sous-traitants (Stripe, Vercel, Resend) sont établis aux États-Unis. Ces transferts sont encadrés par des garanties appropriées : clauses contractuelles types de la Commission européenne (CCT) et/ou certifications adéquates, conformément aux articles 46 et 47 du RGPD.
          </p>
        </section>

        {/* Article 9 */}
        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-3">9. Modifications</h2>
          <p>
            Nous nous réservons le droit de modifier la présente politique à tout moment. Toute modification substantielle sera notifiée aux utilisateurs par email ou via une notification sur le site. La version en vigueur est toujours accessible à l&apos;adresse <strong>villareel.com/confidentialite</strong>.
          </p>
        </section>

        <p className="text-xs text-neutral-400 pt-4 border-t border-neutral-100">
          Dernière mise à jour : mars 2026 — R.E.E.L., SIRET 984 156 794 00013
        </p>
      </div>
    </div>
  );
}
