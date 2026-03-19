import { PrismaClient, AdminRole, Locale, PromoCodeType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database for Villa R.E.E.L...");

  // Admin user
  const admin = await prisma.adminUser.upsert({
    where: { email: "admin@villareel.com" },
    update: {},
    create: {
      email: "admin@villareel.com",
      // Hash bcrypt (rounds=12) du mot de passe initial : VillaREEL_Admin2026!
      // À changer immédiatement après le premier déploiement
      hashedPassword: "$2b$12$Im2eTqWZVP9mOWaiqe.fc.CrqqgAdKSK7K5RHd9wKD1FtODZ15fyy",
      name: "Admin Villa R.E.E.L",
      role: AdminRole.SUPER_ADMIN,
    },
  });

  // Amenities
  const wifi = await prisma.amenity.upsert({
    where: { key: "wifi" },
    update: {
      labelFr: "Wi-Fi",
      labelEn: "Wi-Fi",
      icon: "wifi",
    },
    create: {
      key: "wifi",
      labelFr: "Wi-Fi",
      labelEn: "Wi-Fi",
      icon: "wifi",
    },
  });

  const pool = await prisma.amenity.upsert({
    where: { key: "pool" },
    update: {
      labelFr: "Piscine",
      labelEn: "Swimming pool",
      icon: "pool",
    },
    create: {
      key: "pool",
      labelFr: "Piscine",
      labelEn: "Swimming pool",
      icon: "pool",
    },
  });

  // Villa
  const villa = await prisma.villa.upsert({
    where: { slug: "villa-reel" },
    update: {
      nameFr: "VILLA R.E.E.L",
      nameEn: "VILLA R.E.E.L",
      descriptionFr:
        "Une villa d'exception entre montagne et jardin tropical, pensée pour vos séjours, événements professionnels et collaborations créatives.",
      descriptionEn:
        "An exceptional villa between mountains and tropical garden, designed for your stays, professional events and creative collaborations.",
      address: "1281 route de Moussy",
      city: "Reigner-Esery",
      zipCode: "74930",
      latitude: 46.1167,
      longitude: 6.2167,
      maxGuests: 8,
      bedrooms: 4,
      bathrooms: 3,
      surface: 180,
      pricePerNight: 350,
      cleaningFee: 0,
      deposit: 500,
      minStay: 2,
      maxStay: 21,
      checkInTime: "16:00",
      checkOutTime: "10:00",
      isActive: true,
      isFeatured: true,
    },
    create: {
      slug: "villa-reel",
      nameFr: "VILLA R.E.E.L",
      nameEn: "VILLA R.E.E.L",
      descriptionFr:
        "Une villa d'exception entre montagne et jardin tropical, pensée pour vos séjours, événements professionnels et collaborations créatives.",
      descriptionEn:
        "An exceptional villa between mountains and tropical garden, designed for your stays, professional events and creative collaborations.",
      address: "1281 route de Moussy",
      city: "Reigner-Esery",
      zipCode: "74930",
      latitude: 46.1167,
      longitude: 6.2167,
      maxGuests: 8,
      bedrooms: 4,
      bathrooms: 3,
      surface: 180,
      pricePerNight: 350,
      cleaningFee: 0,
      deposit: 500,
      minStay: 2,
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
          { amenity: { connect: { id: wifi.id } } },
          { amenity: { connect: { id: pool.id } } },
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
  const promo = await prisma.promoCode.upsert({
    where: { code: "WELCOME10" },
    update: {
      type: PromoCodeType.PERCENT,
      value: 10,
      maxUses: 100,
      startDate: new Date(),
      isActive: true,
      description: "10% de réduction sur votre premier séjour",
      minNights: 3,
    },
    create: {
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

  const reservation = await prisma.reservation.upsert({
    where: { confirmationCode: "VR-DEMO-0001" },
    update: {
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
    create: {
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

  await prisma.contactMessage.createMany({
    data: [
      {
        firstName: "Alice",
        lastName: "Martin",
        email: "alice@example.com",
        phone: "+33 6 11 22 33 44",
        subject: "Demande d'informations",
        message:
          "Bonjour, je souhaiterais connaître les disponibilités pour le mois d'août.",
        locale: Locale.FR,
      },
    ],
    skipDuplicates: true,
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

