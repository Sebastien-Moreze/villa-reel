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

  // ── Amenities (50+) ──────────────────────────────────────────────────
  const amenitiesData = [
    // Essentiels
    { key: "wifi", labelFr: "Wi-Fi haut débit", labelEn: "High-speed Wi-Fi", icon: "wifi", category: "essentials" },
    { key: "heating", labelFr: "Chauffage central", labelEn: "Central heating", icon: "thermometer", category: "essentials" },
    { key: "air-conditioning", labelFr: "Climatisation", labelEn: "Air conditioning", icon: "snowflake", category: "essentials" },
    { key: "washing-machine", labelFr: "Lave-linge", labelEn: "Washing machine", icon: "shirt", category: "essentials" },
    { key: "dryer", labelFr: "Sèche-linge", labelEn: "Dryer", icon: "wind", category: "essentials" },
    { key: "iron", labelFr: "Fer à repasser", labelEn: "Iron", icon: "iron", category: "essentials" },
    { key: "hangers", labelFr: "Cintres", labelEn: "Hangers", icon: "hanger", category: "essentials" },
    { key: "bed-linen", labelFr: "Linge de lit", labelEn: "Bed linen", icon: "bed", category: "essentials" },
    { key: "towels", labelFr: "Serviettes de bain", labelEn: "Bath towels", icon: "bath", category: "essentials" },
    { key: "safe", labelFr: "Coffre-fort", labelEn: "Safe", icon: "lock", category: "essentials" },

    // Cuisine
    { key: "full-kitchen", labelFr: "Cuisine entièrement équipée", labelEn: "Fully equipped kitchen", icon: "cooking-pot", category: "kitchen" },
    { key: "oven", labelFr: "Four", labelEn: "Oven", icon: "flame", category: "kitchen" },
    { key: "microwave", labelFr: "Micro-ondes", labelEn: "Microwave", icon: "microwave", category: "kitchen" },
    { key: "dishwasher", labelFr: "Lave-vaisselle", labelEn: "Dishwasher", icon: "utensils-crossed", category: "kitchen" },
    { key: "fridge", labelFr: "Réfrigérateur", labelEn: "Refrigerator", icon: "refrigerator", category: "kitchen" },
    { key: "freezer", labelFr: "Congélateur", labelEn: "Freezer", icon: "thermometer-snowflake", category: "kitchen" },
    { key: "coffee-machine", labelFr: "Machine à café (Nespresso)", labelEn: "Coffee machine (Nespresso)", icon: "coffee", category: "kitchen" },
    { key: "kettle", labelFr: "Bouilloire", labelEn: "Kettle", icon: "cup-soda", category: "kitchen" },
    { key: "toaster", labelFr: "Grille-pain", labelEn: "Toaster", icon: "sandwich", category: "kitchen" },
    { key: "wine-glasses", labelFr: "Verres à vin", labelEn: "Wine glasses", icon: "wine", category: "kitchen" },
    { key: "cookware", labelFr: "Ustensiles de cuisine", labelEn: "Cookware & utensils", icon: "utensils", category: "kitchen" },
    { key: "dining-table", labelFr: "Table à manger (12 pers.)", labelEn: "Dining table (12 guests)", icon: "armchair", category: "kitchen" },

    // Extérieur & Piscine
    { key: "heated-pool", labelFr: "Piscine chauffée", labelEn: "Heated swimming pool", icon: "waves", category: "outdoor" },
    { key: "tropical-garden", labelFr: "Jardin tropical", labelEn: "Tropical garden", icon: "palm-tree", category: "outdoor" },
    { key: "mountain-view", labelFr: "Vue sur les Aravis", labelEn: "Aravis mountain view", icon: "mountain", category: "outdoor" },
    { key: "terrace", labelFr: "Grande terrasse", labelEn: "Large terrace", icon: "sun", category: "outdoor" },
    { key: "outdoor-dining", labelFr: "Espace repas extérieur", labelEn: "Outdoor dining area", icon: "picnic-table", category: "outdoor" },
    { key: "bbq", labelFr: "Barbecue / Plancha", labelEn: "BBQ / Plancha", icon: "flame-kindling", category: "outdoor" },
    { key: "sun-loungers", labelFr: "Transats & bains de soleil", labelEn: "Sun loungers", icon: "rocking-chair", category: "outdoor" },
    { key: "outdoor-lighting", labelFr: "Éclairage d'ambiance extérieur", labelEn: "Outdoor ambient lighting", icon: "lamp", category: "outdoor" },
    { key: "garden-furniture", labelFr: "Mobilier de jardin", labelEn: "Garden furniture", icon: "sofa", category: "outdoor" },
    { key: "parasol", labelFr: "Parasol", labelEn: "Parasol / Umbrella", icon: "umbrella", category: "outdoor" },

    // Chambres & Confort
    { key: "king-beds", labelFr: "Lits king-size", labelEn: "King-size beds", icon: "bed-double", category: "bedroom" },
    { key: "blackout-curtains", labelFr: "Rideaux occultants", labelEn: "Blackout curtains", icon: "blinds", category: "bedroom" },
    { key: "extra-pillows", labelFr: "Oreillers et couettes supplémentaires", labelEn: "Extra pillows & duvets", icon: "pillow", category: "bedroom" },
    { key: "baby-cot", labelFr: "Lit bébé (sur demande)", labelEn: "Baby cot (on request)", icon: "baby", category: "bedroom" },
    { key: "high-chair", labelFr: "Chaise haute bébé", labelEn: "Baby high chair", icon: "baby", category: "bedroom" },
    { key: "dressing-room", labelFr: "Dressing / Penderie", labelEn: "Walk-in wardrobe", icon: "wardrobe", category: "bedroom" },

    // Salle de bain
    { key: "rain-shower", labelFr: "Douche à l'italienne", labelEn: "Walk-in rain shower", icon: "shower-head", category: "bathroom" },
    { key: "bathtub", labelFr: "Baignoire", labelEn: "Bathtub", icon: "bath", category: "bathroom" },
    { key: "hair-dryer", labelFr: "Sèche-cheveux", labelEn: "Hair dryer", icon: "wind", category: "bathroom" },
    { key: "toiletries", labelFr: "Produits d'accueil", labelEn: "Welcome toiletries", icon: "pump-soap", category: "bathroom" },

    // Divertissement
    { key: "smart-tv", labelFr: "Smart TV (Netflix, Disney+)", labelEn: "Smart TV (Netflix, Disney+)", icon: "tv", category: "entertainment" },
    { key: "billiard", labelFr: "Table de billard", labelEn: "Billiard table", icon: "circle-dot", category: "entertainment" },
    { key: "bluetooth-speaker", labelFr: "Enceinte Bluetooth", labelEn: "Bluetooth speaker", icon: "speaker", category: "entertainment" },
    { key: "board-games", labelFr: "Jeux de société", labelEn: "Board games", icon: "dice-5", category: "entertainment" },
    { key: "books", labelFr: "Bibliothèque", labelEn: "Book library", icon: "book-open", category: "entertainment" },
    { key: "outdoor-games", labelFr: "Jeux d'extérieur (pétanque, badminton)", labelEn: "Outdoor games (petanque, badminton)", icon: "target", category: "entertainment" },

    // Sécurité
    { key: "smoke-detector", labelFr: "Détecteur de fumée", labelEn: "Smoke detector", icon: "siren", category: "safety" },
    { key: "fire-extinguisher", labelFr: "Extincteur", labelEn: "Fire extinguisher", icon: "flame", category: "safety" },
    { key: "first-aid-kit", labelFr: "Trousse de premiers secours", labelEn: "First aid kit", icon: "heart-pulse", category: "safety" },
    { key: "security-camera", labelFr: "Caméra extérieure", labelEn: "Outdoor security camera", icon: "cctv", category: "safety" },
    { key: "gated-property", labelFr: "Propriété clôturée et portail", labelEn: "Gated & fenced property", icon: "fence", category: "safety" },

    // Parking & Accès
    { key: "free-parking", labelFr: "Parking privé gratuit", labelEn: "Free private parking", icon: "car", category: "parking" },
    { key: "ev-charger", labelFr: "Borne de recharge véhicule électrique", labelEn: "EV charging station", icon: "plug-zap", category: "parking" },
    { key: "step-free-access", labelFr: "Accès de plain-pied", labelEn: "Step-free access", icon: "accessibility", category: "parking" },

    // Services & Extras
    { key: "welcome-basket", labelFr: "Panier de bienvenue", labelEn: "Welcome basket", icon: "gift", category: "services" },
    { key: "concierge", labelFr: "Service conciergerie", labelEn: "Concierge service", icon: "concierge-bell", category: "services" },
    { key: "private-chef", labelFr: "Chef privé (sur demande)", labelEn: "Private chef (on request)", icon: "chef-hat", category: "services" },
    { key: "wine-tasting", labelFr: "Dégustation de vins (ViniLux)", labelEn: "Wine tasting (ViniLux)", icon: "grape", category: "services" },
    { key: "event-coordinator", labelFr: "Coordination événementielle", labelEn: "Event coordination", icon: "calendar-heart", category: "services" },
    { key: "cleaning-service", labelFr: "Ménage inclus", labelEn: "Cleaning included", icon: "sparkles", category: "services" },
  ];

  const amenityRecords = [];
  for (const a of amenitiesData) {
    const record = await prisma.amenity.upsert({
      where: { key: a.key },
      update: { labelFr: a.labelFr, labelEn: a.labelEn, icon: a.icon, category: a.category },
      create: a,
    });
    amenityRecords.push(record);
  }

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
      maxGuests: 13,
      bedrooms: 6,
      bathrooms: 3,
      surface: 250,
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
      maxGuests: 13,
      bedrooms: 6,
      bathrooms: 3,
      surface: 250,
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
            url: "/images/villa/villa-facade-entree.jpg",
            altFr: "Vue extérieure de la villa",
            altEn: "Outside view of the villa",
            position: 1,
          },
        ],
      },
      amenities: {
        create: amenityRecords.map((a) => ({
          amenity: { connect: { id: a.id } },
        })),
      },
      seasonalPrices: {
        create: [
          {
            name: "Haute saison été",
            startDate: new Date("2026-07-01"),
            endDate: new Date("2026-08-31"),
            pricePerNight: 450,
            minStay: 7,
          },
        ],
      },
    },
  });

  // Sync all amenities to villa (handles both create and update cases)
  for (const a of amenityRecords) {
    await prisma.villaAmenity.upsert({
      where: { villaId_amenityId: { villaId: villa.id, amenityId: a.id } },
      update: {},
      create: { villaId: villa.id, amenityId: a.id },
    });
  }

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

