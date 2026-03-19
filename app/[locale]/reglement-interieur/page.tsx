import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Règlement intérieur – Villa R.E.E.L",
  robots: { index: false },
};

type PageProps = { params: Promise<{ locale: string }> };

export default async function ReglementInterieurPage({ params }: PageProps) {
  const { locale } = await params;
  void locale;

  const sections = [
    {
      num: "1",
      title: "Arrivée & Départ",
      items: [
        "Check-in à partir de 15h.",
        "Check-out avant 15h.",
        "Toute demande d'arrivée anticipée ou de départ tardif doit être validée au préalable.",
        "Merci de respecter ces horaires afin de garantir une préparation irréprochable pour chaque séjour.",
      ],
    },
    {
      num: "2",
      title: "Occupation des lieux",
      items: [
        "La villa est exclusivement réservée aux voyageurs déclarés lors de la réservation.",
        "Toute personne supplémentaire non autorisée entraînera l'annulation immédiate du séjour sans remboursement.",
        "La sous-location est strictement interdite.",
      ],
    },
    {
      num: "3",
      title: "Respect du voisinage & tranquillité",
      items: [
        "Les fêtes, événements et soirées non autorisés sont strictement interdits.",
        "Le calme doit être respecté entre 22h et 8h.",
        "Toute nuisance sonore excessive pourra entraîner l'interruption immédiate du séjour.",
      ],
    },
    {
      num: "4",
      title: "Piscine & espaces extérieurs",
      items: [
        "L'utilisation de la piscine et des installations extérieures se fait sous votre entière responsabilité.",
        "Les enfants doivent être surveillés en permanence.",
        "Il est interdit de courir ou de plonger si la profondeur ne le permet pas.",
        "Les verres et objets cassables sont interdits autour de la piscine.",
        "Merci de respecter le mobilier extérieur et de le laisser à son emplacement initial.",
      ],
    },
    {
      num: "5",
      title: "Propreté & soin des lieux",
      items: [
        "La villa vous est confiée dans un état impeccable.",
        "Respecter les équipements et le mobilier.",
        "Laisser la cuisine propre (vaisselle faite, plans de travail nettoyés).",
        "Trier et sortir les déchets conformément aux consignes locales.",
        "Signaler immédiatement tout incident ou dommage.",
        "Toute dégradation ou négligence sera facturée.",
      ],
    },
    {
      num: "6",
      title: "Mobilier & équipements",
      items: [
        "Le mobilier intérieur ne doit pas être déplacé vers l'extérieur.",
        "Les serviettes de bain ne doivent pas être utilisées pour la piscine — des serviettes dédiées sont fournies.",
        "Les appareils électriques, lumières, climatisation et chauffage doivent être éteints lors de votre départ.",
      ],
    },
    {
      num: "7",
      title: "Interdiction de fumer",
      items: [
        "La villa est entièrement non-fumeur.",
        "Toute trace d'odeur ou de consommation à l'intérieur entraînera des frais de remise en état.",
      ],
    },
    {
      num: "8",
      title: "Animaux",
      items: ["Les animaux ne sont pas acceptés."],
    },
    {
      num: "9",
      title: "Sécurité",
      items: [
        "Merci de fermer portes, fenêtres et portail lors de vos absences.",
        "Le propriétaire décline toute responsabilité en cas de perte, vol ou accident.",
        "L'utilisation des équipements se fait sous votre responsabilité.",
      ],
    },
    {
      num: "10",
      title: "Respect du standing",
      items: [
        "Cette villa est un lieu d'exception destiné à une clientèle recherchant confort, élégance et discrétion.",
        "Nous comptons sur votre sens des responsabilités afin que chaque séjour reste une expérience haut de gamme, tant pour vous que pour les futurs voyageurs.",
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <p className="text-xs uppercase tracking-[0.3em] text-primary/70">Villa R.E.E.L</p>
      <h1 className="font-display mt-2 text-3xl font-bold text-neutral-900">Règlement intérieur</h1>

      <div className="mt-4 rounded-xl bg-neutral-50 border border-neutral-100 p-5 text-sm text-neutral-600 leading-relaxed italic">
        Nous sommes heureux de vous accueillir dans notre villa et vous remercions pour votre confiance.
        Cette propriété a été pensée comme un lieu d&apos;exception. Nous vous remercions de contribuer
        à préserver son standing et sa sérénité.
      </div>

      <div className="mt-10 space-y-6 text-sm text-neutral-700 leading-relaxed">
        {sections.map((section) => (
          <section key={section.num} className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {section.num}
              </span>
              <h2 className="text-sm font-semibold text-neutral-900 pt-0.5">{section.title}</h2>
            </div>
            <ul className="mt-3 ml-10 space-y-1.5 text-sm text-neutral-600">
              {section.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/40" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-10 rounded-xl bg-neutral-900 px-6 py-5 text-sm text-neutral-300 leading-relaxed">
        <p>
          En réservant la Villa R.E.E.L, vous confirmez avoir lu et accepté le présent règlement intérieur.
          Tout manquement pourra entraîner des frais supplémentaires ou l&apos;interruption du séjour.
        </p>
        <p className="mt-4 text-right font-semibold italic text-secondary">— Estelle & Rodrigue</p>
      </div>

      <p className="mt-8 text-xs text-neutral-400 pt-4 border-t border-neutral-100">
        Dernière mise à jour : mars 2026 — R.E.E.L., SIRET 984 156 794 00013
      </p>
    </div>
  );
}
