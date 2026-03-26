/**
 * Script de nettoyage — Supprime toutes les réservations de test
 * et tous les messages de contact de la base de données.
 *
 * Usage :  npx tsx scripts/cleanup-tests.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Nettoyage de la base de données…\n");

  // 1. Supprimer les avis liés aux réservations (cascade automatique, mais on le fait explicitement)
  const deletedReviews = await prisma.review.deleteMany({});
  console.log(`   ✓ ${deletedReviews.count} avis supprimé(s)`);

  // 2. Supprimer toutes les réservations
  const deletedReservations = await prisma.reservation.deleteMany({});
  console.log(`   ✓ ${deletedReservations.count} réservation(s) supprimée(s)`);

  // 3. Supprimer tous les messages de contact
  const deletedMessages = await prisma.contactMessage.deleteMany({});
  console.log(`   ✓ ${deletedMessages.count} message(s) de contact supprimé(s)`);

  console.log("\n✅ Nettoyage terminé !");
}

main()
  .catch((e) => {
    console.error("❌ Erreur :", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
