import PDFDocument from "pdfkit";

/**
 * Génère le PDF du règlement intérieur de la Villa R.E.E.L.
 * Retourne un Buffer prêt à être attaché à un email (via Resend).
 */
export async function generateHouseRulesPdf(
  locale: "fr" | "en" = "fr",
): Promise<Buffer> {
  const isFr = locale === "fr";

  const sections = isFr
    ? [
        {
          title: "1. Arrivée & Départ",
          items: [
            "Check-in à partir de 15h.",
            "Check-out avant 15h.",
            "Toute demande d'arrivée anticipée ou de départ tardif doit être validée au préalable.",
            "Merci de respecter ces horaires afin de garantir une préparation irréprochable pour chaque séjour.",
          ],
        },
        {
          title: "2. Occupation des lieux",
          items: [
            "La villa est exclusivement réservée aux voyageurs déclarés lors de la réservation.",
            "Toute personne supplémentaire non autorisée entraînera l'annulation immédiate du séjour sans remboursement.",            "La sous-location est strictement interdite.",
          ],
        },
        {
          title: "3. Respect du voisinage & tranquillité",
          items: [
            "Les fêtes, événements et soirées non autorisés sont strictement interdits.",
            "Le calme doit être respecté entre 22h et 8h.",
            "Toute nuisance sonore excessive pourra entraîner l'interruption immédiate du séjour.",
          ],
        },
        {
          title: "4. Piscine & espaces extérieurs",
          items: [
            "L'utilisation de la piscine et des installations extérieures se fait sous votre entière responsabilité.",
            "Les enfants doivent être surveillés en permanence.",
            "Il est interdit de courir ou de plonger si la profondeur ne le permet pas.",
            "Les verres et objets cassables sont interdits autour de la piscine.",
            "Merci de respecter le mobilier extérieur et de le laisser à son emplacement initial.",
          ],
        },
        {
          title: "5. Propreté & soin des lieux",
          items: [
            "La villa vous est confiée dans un état impeccable.",
            "Respecter les équipements et le mobilier.",
            "Laisser la cuisine propre (vaisselle faite, plans de travail nettoyés).",
            "Trier et sortir les déchets conformément aux consignes locales.",
            "Signaler immédiatement tout incident ou dommage.",            "Toute dégradation ou négligence sera facturée.",
          ],
        },
        {
          title: "6. Mobilier & équipements",
          items: [
            "Le mobilier intérieur ne doit pas être déplacé vers l'extérieur.",
            "Les serviettes de bain ne doivent pas être utilisées pour la piscine — des serviettes dédiées sont fournies.",
            "Les appareils électriques, lumières, climatisation et chauffage doivent être éteints lors de votre départ.",
          ],
        },
        {
          title: "7. Interdiction de fumer",
          items: [
            "La villa est entièrement non-fumeur.",
            "Toute trace d'odeur ou de consommation à l'intérieur entraînera des frais de remise en état.",
          ],
        },
        {
          title: "8. Animaux",
          items: ["Les animaux ne sont pas acceptés."],
        },
        {
          title: "9. Sécurité",
          items: [
            "Merci de fermer portes, fenêtres et portail lors de vos absences.",
            "Le propriétaire décline toute responsabilité en cas de perte, vol ou accident.",
            "L'utilisation des équipements se fait sous votre responsabilité.",
          ],        },
        {
          title: "10. Respect du standing",
          items: [
            "Cette villa est un lieu d'exception destiné à une clientèle recherchant confort, élégance et discrétion.",
            "Nous comptons sur votre sens des responsabilités afin que chaque séjour reste une expérience haut de gamme, tant pour vous que pour les futurs voyageurs.",
          ],
        },
      ]
    : [
        {
          title: "1. Arrival & Departure",
          items: [
            "Check-in from 3:00 PM.",
            "Check-out before 3:00 PM.",
            "Any request for early arrival or late departure must be approved in advance.",
            "Please respect these times to ensure impeccable preparation for each stay.",
          ],
        },
        {
          title: "2. Occupancy",
          items: [
            "The villa is exclusively reserved for guests declared at the time of booking.",
            "Any unauthorized additional person will result in the immediate cancellation of the stay without refund.",
            "Subletting is strictly prohibited.",
          ],
        },
        {
          title: "3. Neighbourhood & Quiet Hours",
          items: [            "Unauthorized parties, events and gatherings are strictly prohibited.",
            "Quiet hours must be observed between 10:00 PM and 8:00 AM.",
            "Excessive noise may result in the immediate termination of the stay.",
          ],
        },
        {
          title: "4. Pool & Outdoor Areas",
          items: [
            "Use of the pool and outdoor facilities is at your own risk.",
            "Children must be supervised at all times.",
            "Running and diving are prohibited where depth does not permit.",
            "Glass and breakable objects are not allowed around the pool.",
            "Please respect the outdoor furniture and leave it in its original position.",
          ],
        },
        {
          title: "5. Cleanliness & Care",
          items: [
            "The villa is entrusted to you in impeccable condition.",
            "Respect the equipment and furniture.",
            "Leave the kitchen clean (dishes done, counters wiped).",
            "Sort and take out rubbish according to local guidelines.",
            "Report any incident or damage immediately.",
            "Any damage or negligence will be charged.",
          ],
        },
        {
          title: "6. Furniture & Equipment",
          items: [
            "Indoor furniture must not be moved outdoors.",            "Bath towels must not be used for the pool — dedicated towels are provided.",
            "Electrical appliances, lights, air conditioning and heating must be turned off when you leave.",
          ],
        },
        {
          title: "7. No Smoking",
          items: [
            "The villa is entirely non-smoking.",
            "Any trace of odour or indoor consumption will incur restoration charges.",
          ],
        },
        {
          title: "8. Pets",
          items: ["Pets are not allowed."],
        },
        {
          title: "9. Security",
          items: [
            "Please lock doors, windows and the gate when you leave.",
            "The owner declines all responsibility in the event of loss, theft or accident.",
            "Use of the facilities is at your own risk.",
          ],
        },
        {
          title: "10. Upholding Standards",
          items: [
            "This villa is an exceptional property for guests seeking comfort, elegance and discretion.",
            "We count on your sense of responsibility to ensure every stay is a premium experience, for you and for future guests.",
          ],        },
      ];

  const intro = isFr
    ? "Nous sommes heureux de vous accueillir dans notre villa et vous remercions pour votre confiance. Cette propriété a été pensée comme un lieu d'exception. Nous vous remercions de contribuer à préserver son standing et sa sérénité."
    : "We are delighted to welcome you to our villa and thank you for your trust. This property was designed as an exceptional venue. We thank you for helping to maintain its standards and serenity.";

  const closing = isFr
    ? "En réservant la Villa R.E.E.L, vous confirmez avoir lu et accepté le présent règlement intérieur. Tout manquement pourra entraîner des frais supplémentaires ou l'interruption du séjour."
    : "By booking Villa R.E.E.L, you confirm that you have read and accepted these house rules. Any breach may result in additional charges or the termination of your stay.";

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 60, bottom: 60, left: 55, right: 55 },
      info: {
        Title: isFr ? "Règlement intérieur – Villa R.E.E.L" : "House Rules – Villa R.E.E.L",
        Author: "Villa R.E.E.L",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    const GREEN = "#1A6B3A";
    const DARK = "#111827";
    const GRAY = "#374151";

    doc.rect(0, 0, doc.page.width, 100).fill(GREEN);
    doc.font("Helvetica").fontSize(9).fillColor("#bbf7d0").text("VILLA", 0, 35, { align: "center", characterSpacing: 4 });
    doc.fontSize(14).fillColor("#ffffff").text("R.E.E.L", 0, 48, { align: "center", characterSpacing: 5 });
    doc.fontSize(16).fillColor("#ffffff").text(isFr ? "Règlement intérieur" : "House Rules", 0, 70, { align: "center" });

    doc.moveDown(3);
    doc.font("Helvetica-Oblique").fontSize(10).fillColor(GRAY).text(intro, { align: "justify", lineGap: 3 });
    doc.moveDown(1);

    for (const section of sections) {
      if (doc.y > doc.page.height - 140) doc.addPage();
      doc.font("Helvetica-Bold").fontSize(11).fillColor(GREEN).text(section.title);
      doc.moveDown(0.3);
      for (const item of section.items) {
        if (doc.y > doc.page.height - 80) doc.addPage();
        doc.font("Helvetica").fontSize(9.5).fillColor(DARK);
        const x = doc.x;
        doc.text("  •  " + item, x, doc.y, { align: "left", lineGap: 2, indent: 8 });
        doc.moveDown(0.15);
      }
      doc.moveDown(0.6);
    }
    if (doc.y > doc.page.height - 120) doc.addPage();
    doc.moveDown(0.5);
    doc.rect(doc.x - 5, doc.y - 5, doc.page.width - 100, 60).fill("#f9fafb").stroke();
    doc.font("Helvetica").fontSize(9).fillColor(DARK).text(closing, doc.x, doc.y + 5, { align: "justify", lineGap: 2, width: doc.page.width - 120 });
    doc.moveDown(1.5);
    doc.font("Helvetica-Oblique").fontSize(10).fillColor(GREEN).text("— Estelle & Rodrigue", { align: "right" });
    doc.moveDown(1);
    doc.font("Helvetica").fontSize(7.5).fillColor("#9ca3af").text(
      isFr ? "Dernière mise à jour : mars 2026 — R.E.E.L., SIRET 984 156 794 00013" : "Last updated: March 2026 — R.E.E.L., SIRET 984 156 794 00013",
      { align: "center" },
    );
    doc.end();
  });
}