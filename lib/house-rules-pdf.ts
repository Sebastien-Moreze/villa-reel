import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

/**
 * Génère le PDF du règlement intérieur de la Villa R.E.E.L.
 * Utilise pdf-lib (100% JS, compatible Vercel serverless).
 * Retourne un Buffer prêt à être attaché à un email (via Resend).
 */
export async function generateHouseRulesPdf(
  locale: "fr" | "en" = "fr",
): Promise<Buffer> {
  const isFr = locale === "fr";

  const sections = isFr
    ? [
        { title: "1. Arrivée & Départ", items: [
            "Check-in à partir de 15h.",
            "Check-out avant 15h.",
            "Toute demande d'arrivée anticipée ou de départ tardif doit être validée au préalable.",
            "Merci de respecter ces horaires afin de garantir une préparation irréprochable pour chaque séjour.",
        ]},
        { title: "2. Occupation des lieux", items: [
            "La villa est exclusivement réservée aux voyageurs déclarés lors de la réservation.",
            "Toute personne supplémentaire non autorisée entraînera l'annulation immédiate du séjour sans remboursement.",
            "La sous-location est strictement interdite.",
        ]},
        { title: "3. Respect du voisinage & tranquillité", items: [            "Les fêtes, événements et soirées non autorisés sont strictement interdits.",
            "Le calme doit être respecté entre 22h et 8h.",
            "Toute nuisance sonore excessive pourra entraîner l'interruption immédiate du séjour.",
        ]},
        { title: "4. Piscine & espaces extérieurs", items: [
            "L'utilisation de la piscine et des installations extérieures se fait sous votre entière responsabilité.",
            "Les enfants doivent être surveillés en permanence.",
            "Il est interdit de courir ou de plonger si la profondeur ne le permet pas.",
            "Les verres et objets cassables sont interdits autour de la piscine.",
            "Merci de respecter le mobilier extérieur et de le laisser à son emplacement initial.",
        ]},
        { title: "5. Propreté & soin des lieux", items: [
            "La villa vous est confiée dans un état impeccable.",
            "Respecter les équipements et le mobilier.",
            "Laisser la cuisine propre (vaisselle faite, plans de travail nettoyés).",
            "Trier et sortir les déchets conformément aux consignes locales.",
            "Signaler immédiatement tout incident ou dommage.",
            "Toute dégradation ou négligence sera facturée.",
        ]},
        { title: "6. Mobilier & équipements", items: [
            "Le mobilier intérieur ne doit pas être déplacé vers l'extérieur.",
            "Les serviettes de bain ne doivent pas être utilisées pour la piscine — des serviettes dédiées sont fournies.",
            "Les appareils électriques, lumières, climatisation et chauffage doivent être éteints lors de votre départ.",
        ]},
        { title: "7. Interdiction de fumer", items: [
            "La villa est entièrement non-fumeur.",
            "Toute trace d'odeur ou de consommation à l'intérieur entraînera des frais de remise en état.",
        ]},
        { title: "8. Animaux", items: ["Les animaux ne sont pas acceptés."] },
        { title: "9. Sécurité", items: [            "Merci de fermer portes, fenêtres et portail lors de vos absences.",
            "Le propriétaire décline toute responsabilité en cas de perte, vol ou accident.",
            "L'utilisation des équipements se fait sous votre responsabilité.",
        ]},
        { title: "10. Respect du standing", items: [
            "Cette villa est un lieu d'exception destiné à une clientèle recherchant confort, élégance et discrétion.",
            "Nous comptons sur votre sens des responsabilités afin que chaque séjour reste une expérience haut de gamme, tant pour vous que pour les futurs voyageurs.",
        ]},
      ]
    : [
        { title: "1. Arrival & Departure", items: [
            "Check-in from 3:00 PM.",
            "Check-out before 3:00 PM.",
            "Any request for early arrival or late departure must be approved in advance.",
            "Please respect these times to ensure impeccable preparation for each stay.",
        ]},
        { title: "2. Occupancy", items: [
            "The villa is exclusively reserved for guests declared at the time of booking.",
            "Any unauthorized additional person will result in the immediate cancellation of the stay without refund.",
            "Subletting is strictly prohibited.",
        ]},
        { title: "3. Neighbourhood & Quiet Hours", items: [
            "Unauthorized parties, events and gatherings are strictly prohibited.",
            "Quiet hours must be observed between 10:00 PM and 8:00 AM.",
            "Excessive noise may result in the immediate termination of the stay.",
        ]},
        { title: "4. Pool & Outdoor Areas", items: [
            "Use of the pool and outdoor facilities is at your own risk.",
            "Children must be supervised at all times.",
            "Running and diving are prohibited where depth does not permit.",            "Glass and breakable objects are not allowed around the pool.",
            "Please respect the outdoor furniture and leave it in its original position.",
        ]},
        { title: "5. Cleanliness & Care", items: [
            "The villa is entrusted to you in impeccable condition.",
            "Respect the equipment and furniture.",
            "Leave the kitchen clean (dishes done, counters wiped).",
            "Sort and take out rubbish according to local guidelines.",
            "Report any incident or damage immediately.",
            "Any damage or negligence will be charged.",
        ]},
        { title: "6. Furniture & Equipment", items: [
            "Indoor furniture must not be moved outdoors.",
            "Bath towels must not be used for the pool — dedicated towels are provided.",
            "Electrical appliances, lights, air conditioning and heating must be turned off when you leave.",
        ]},
        { title: "7. No Smoking", items: [
            "The villa is entirely non-smoking.",
            "Any trace of odour or indoor consumption will incur restoration charges.",
        ]},
        { title: "8. Pets", items: ["Pets are not allowed."] },
        { title: "9. Security", items: [
            "Please lock doors, windows and the gate when you leave.",
            "The owner declines all responsibility in the event of loss, theft or accident.",
            "Use of the facilities is at your own risk.",
        ]},
        { title: "10. Upholding Standards", items: [
            "This villa is an exceptional property for guests seeking comfort, elegance and discretion.",
            "We count on your sense of responsibility to ensure every stay is a premium experience, for you and for future guests.",
        ]},      ];

  const intro = isFr
    ? "Nous sommes heureux de vous accueillir dans notre villa et vous remercions pour votre confiance. Cette propriete a ete pensee comme un lieu d'exception. Nous vous remercions de contribuer a preserver son standing et sa serenite."
    : "We are delighted to welcome you to our villa and thank you for your trust. This property was designed as an exceptional venue. We thank you for helping to maintain its standards and serenity.";

  const closing = isFr
    ? "En reservant la Villa R.E.E.L, vous confirmez avoir lu et accepte le present reglement interieur. Tout manquement pourra entrainer des frais supplementaires ou l'interruption du sejour."
    : "By booking Villa R.E.E.L, you confirm that you have read and accepted these house rules. Any breach may result in additional charges or the termination of your stay.";

  // ── Création du PDF avec pdf-lib ──
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const PAGE_WIDTH = 595.28; // A4
  const PAGE_HEIGHT = 841.89;
  const MARGIN = 55;
  const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;
  const GREEN = rgb(0.102, 0.42, 0.227);  // #1A6B3A
  const DARK = rgb(0.067, 0.094, 0.153);   // #111827
  const GRAY = rgb(0.216, 0.255, 0.318);   // #374151
  const WHITE = rgb(1, 1, 1);
  const LIGHT_GREEN = rgb(0.733, 0.969, 0.827); // #bbf7d0
  const BG_GRAY = rgb(0.976, 0.98, 0.984); // #f9fafb
  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT;

  // ── Helper: wrap text into lines ──
  function wrapText(text: string, font: typeof helvetica, fontSize: number, maxWidth: number): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, fontSize);
      if (width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  // ── Helper: ensure space, add page if needed ──
  function ensureSpace(needed: number) {
    if (y - needed < 60) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
  }
  // ── Header bar ──
  page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 100, width: PAGE_WIDTH, height: 100, color: GREEN });
  page.drawText("VILLA", { x: PAGE_WIDTH / 2 - helvetica.widthOfTextAtSize("VILLA", 9) / 2, y: PAGE_HEIGHT - 40, size: 9, font: helvetica, color: LIGHT_GREEN });
  page.drawText("R.E.E.L", { x: PAGE_WIDTH / 2 - helveticaBold.widthOfTextAtSize("R.E.E.L", 14) / 2, y: PAGE_HEIGHT - 58, size: 14, font: helveticaBold, color: WHITE });
  const titleText = isFr ? "Reglement interieur" : "House Rules";
  page.drawText(titleText, { x: PAGE_WIDTH / 2 - helveticaBold.widthOfTextAtSize(titleText, 16) / 2, y: PAGE_HEIGHT - 82, size: 16, font: helveticaBold, color: WHITE });

  y = PAGE_HEIGHT - 120;

  // ── Intro ──
  const introLines = wrapText(intro, helveticaOblique, 10, CONTENT_WIDTH);
  for (const line of introLines) {
    page.drawText(line, { x: MARGIN, y, size: 10, font: helveticaOblique, color: GRAY });
    y -= 14;
  }
  y -= 10;

  // ── Sections ──
  for (const section of sections) {
    ensureSpace(40);
    page.drawText(section.title, { x: MARGIN, y, size: 11, font: helveticaBold, color: GREEN });
    y -= 16;

    for (const item of section.items) {
      const bulletText = `  •  ${item}`;
      const lines = wrapText(bulletText, helvetica, 9.5, CONTENT_WIDTH - 10);
      ensureSpace(lines.length * 13 + 5);
      for (const line of lines) {
        page.drawText(line, { x: MARGIN + 8, y, size: 9.5, font: helvetica, color: DARK });        y -= 13;
      }
      y -= 2;
    }
    y -= 8;
  }

  // ── Closing box ──
  ensureSpace(80);
  page.drawRectangle({ x: MARGIN - 5, y: y - 50, width: CONTENT_WIDTH + 10, height: 55, color: BG_GRAY });
  y -= 5;
  const closingLines = wrapText(closing, helvetica, 9, CONTENT_WIDTH - 10);
  for (const line of closingLines) {
    page.drawText(line, { x: MARGIN, y, size: 9, font: helvetica, color: DARK });
    y -= 12;
  }
  y -= 15;

  // ── Signature ──
  ensureSpace(30);
  const sig = "-- Estelle & Rodrigue";
  page.drawText(sig, { x: PAGE_WIDTH - MARGIN - helveticaOblique.widthOfTextAtSize(sig, 10), y, size: 10, font: helveticaOblique, color: GREEN });
  y -= 20;

  // ── Footer ──
  const footer = isFr
    ? "Derniere mise a jour : mars 2026 -- R.E.E.L., SIRET 984 156 794 00013"
    : "Last updated: March 2026 -- R.E.E.L., SIRET 984 156 794 00013";
  page.drawText(footer, { x: PAGE_WIDTH / 2 - helvetica.widthOfTextAtSize(footer, 7.5) / 2, y: 40, size: 7.5, font: helvetica, color: rgb(0.612, 0.639, 0.682) });
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}