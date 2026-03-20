/**
 * Script utilitaire : Génère un reviewToken de test pour la dernière réservation.
 *
 * Usage :
 *   npx tsx scripts/generate-review-token.ts
 *   npx tsx scripts/generate-review-token.ts 42    # pour la réservation #42
 */

import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

async function main() {
  const reservationId = process.argv[2] ? parseInt(process.argv[2]) : undefined;

  let reservation;

  if (reservationId) {
    reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { review: true },
    });
  } else {
    /* Prendre la dernière réservation confirmée sans avis */
    reservation = await prisma.reservation.findFirst({
      where: {
        status: "CONFIRMED",
        review: null,
      },
      orderBy: { createdAt: "desc" },
      include: { review: true },
    });
  }

  if (!reservation) {
    console.error("❌ Aucune réservation trouvée.");
    console.log("   Créez une réservation de test d'abord, ou passez un ID en argument.");
    process.exit(1);
  }

  if (reservation.review) {
    console.error(`❌ La réservation #${reservation.id} a déjà un avis.`);
    process.exit(1);
  }

  const token = randomBytes(32).toString("hex");

  await prisma.reservation.update({
    where: { id: reservation.id },
    data: { reviewToken: token },
  });

  const locale = reservation.locale === "EN" ? "en" : "fr";

  console.log("✅ Token généré avec succès !\n");
  console.log(`   Réservation : #${reservation.id} — ${reservation.guestName}`);
  console.log(`   Token       : ${token}`);
  console.log(`   Lien        : http://localhost:3000/${locale}/avis/${token}`);
  console.log(`\n   Ouvre ce lien dans ton navigateur pour tester le formulaire d'avis.`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
