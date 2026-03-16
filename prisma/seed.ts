import { PrismaClient, AdminRole, Locale, PromoCodeType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database for Villa R.E.E.L...");

  // Admin user
  const admin = await prisma.adminUser.upsert({
    where: { email: "admin@villareel.fr" },
    update: {},
    create: {
      email: "admin@villareel.fr",
      // À remplacer par un hash Bcrypt dans la vraie vie
      hashedPassword: "changeme",
      name: "Admin Villa R.E.E.L",
      role: AdminRole.SUPER_ADMIN,
    },
  });

  // Amenities
  const wifi = await prisma.amenity.create({
    data: {
      key: "wifi",
      labelFr: "Wi-Fi",
      labelEn: "Wi-Fi",
      icon: "wifi",
    },
  });

  const pool = await prisma.amenity.create({
    data: {
      key: "pool",
      labelFr: "Piscine",
      labelEn: "Swimming pool",
      icon: "pool",
    },
  });

  // Villa
  const villa = await prisma.villa.create({
    data: {
      slug: "villa-reel-demo",
      nameFr: "Villa R.E.E.L Démo",
      nameEn: "Villa R.E.E.L Demo",
      descriptionFr:
        "Magnifique villa en bord de mer pour des séjours inoubliables.",
      descriptionEn:
        "Beautiful seaside villa for unforgettable stays.",
      address: "1 Rue de la Plage",
      city: "Nice",
      zipCode: "06000",
      latitude: 43.7102,
      longitude: 7.2620,
      maxGuests: 8,
      bedrooms: 4,
      bathrooms: 3,
      surface: 180,
      pricePerNight: 350,
      cleaningFee: 80,
      deposit: 500,
      minStay: 3,
      maxStay: 21,
      checkInTime: "16:00",
      checkOutTime: "10:00",
      isActive: true,
      isFeatured: true,
      images: {
        create: [
          {
            url: "/images/villa/main.jpg",
            altFr: "Vue extérieure de la villa",
            altEn: "Outside view of the villa",
            position: 1,
          },
        ],
      },
      amenities: {
        create: [
          {
            amenity: {
              connect: { id: wifi.id },
            },
          },
          {
            amenity: {
              connect: { id: pool.id },
            },
          },
        ],
      },
      seasonalPrices: {
        create: [
          {
            name: "Haute saison été",
            startDate: new Date("2025-07-01"),
            endDate: new Date("2025-08-31"),
            pricePerNight: 450,
            minStay: 7,
          },
        ],
      },
    },
  });

  // Promo code
  const promo = await prisma.promoCode.create({
    data: {
      code: "WELCOME10",
      type: PromoCodeType.PERCENT,
      value: 10,
      maxUses: 100,
      startDate: new Date(),
      isActive: true,
      description: "10% de réduction sur votre premier séjour",
      minNights: 3,
    },
  });

  // Example reservation
  const today = new Date();
  const inSevenDays = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const inFourteenDays = new Date(
    today.getTime() + 14 * 24 * 60 * 60 * 1000,
  );

  const pricePerNightNumber = Number(villa.pricePerNight);
  const cleaningFeeNumber = Number(villa.cleaningFee);
  const totalAmountNumber = 7 * pricePerNightNumber + cleaningFeeNumber;

  const reservation = await prisma.reservation.create({
    data: {
      confirmationCode: "VR-DEMO-0001",
      villaId: villa.id,
      guestName: "John Doe",
      guestEmail: "john.doe@example.com",
      guestPhone: "+33 6 12 34 56 78",
      guestAddress: "123 Rue de Démonstration, 75000 Paris, France",
      checkIn: inSevenDays,
      checkOut: inFourteenDays,
      nbGuests: 4,
      nbNights: 7,
      pricePerNight: villa.pricePerNight,
      cleaningFee: villa.cleaningFee,
      discount: 0,
      totalAmount: totalAmountNumber,
      depositAmount: 500,
      balanceAmount: totalAmountNumber - 500,
      status: "CONFIRMED",
      paymentStatus: "FULLY_PAID",
      stripePaymentIntentId: "pi_demo_123",
      locale: Locale.FR,
      promoCodeId: promo.id,
    },
  });

  await prisma.contactMessage.create({
    data: {
      firstName: "Alice",
      lastName: "Martin",
      email: "alice@example.com",
      phone: "+33 6 11 22 33 44",
      subject: "Demande d'informations",
      message:
        "Bonjour, je souhaiterais connaître les disponibilités pour le mois d'août.",
      locale: Locale.FR,
    },
  });

  console.log("Seed completed. Admin id:", admin.id, "Villa id:", villa.id, "Reservation id:", reservation.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

