import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { GallerySection } from "@/components/home/GallerySection";
import { ReviewsBanner } from "@/components/home/ReviewsBanner";
import { PromoSection } from "@/components/home/PromoSection";
import { locales } from "@/i18n";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata(
  { params }: PageProps,
): Promise<Metadata> {
  const { locale } = await params;

  const baseUrl = "https://www.villareel.com";
  const ogImage = `${baseUrl}/images/hero/hero-banner.jpg`;

  if (locale === "en") {
    return {
      title: "Villa R.E.E.L – Between Alps and Tropics",
      description:
        "Exceptional villa between Alps and tropical garden for stays, corporate events and creative collaborations.",
      alternates: {
        canonical: `${baseUrl}/en`,
        languages: { fr: `${baseUrl}/fr`, en: `${baseUrl}/en` },
      },
      openGraph: {
        title: "Villa R.E.E.L – Between Alps and Tropics",
        description:
          "A unique villa near the Alps with heated pool and tropical garden, ideal for holidays and corporate retreats.",
        type: "website",
        url: `${baseUrl}/en`,
        siteName: "Villa R.E.E.L",
        locale: "en_GB",
        images: [{ url: ogImage, width: 1200, height: 630, alt: "Villa R.E.E.L – Between Alps and Tropics" }],
      },
      twitter: {
        card: "summary_large_image",
        title: "Villa R.E.E.L – Between Alps and Tropics",
        description: "Exceptional villa between Alps and tropical garden.",
        images: [ogImage],
      },
    };
  }

  return {
    title: "Villa R.E.E.L – Entre Alpes et Tropiques",
    description:
      "Villa d'exception entre Alpes et jardin tropical pour séjours, événements d'entreprise et collaborations créatives.",
    alternates: {
      canonical: `${baseUrl}/fr`,
      languages: { fr: `${baseUrl}/fr`, en: `${baseUrl}/en` },
    },
    openGraph: {
      title: "Villa R.E.E.L – Entre Alpes et Tropiques",
      description:
        "Une villa unique proche des Alpes avec piscine chauffée et jardin tropical, idéale pour vos séjours et séminaires.",
      type: "website",
      url: `${baseUrl}/fr`,
      siteName: "Villa R.E.E.L",
      locale: "fr_FR",
      images: [{ url: ogImage, width: 1200, height: 630, alt: "Villa R.E.E.L – Entre Alpes et Tropiques" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Villa R.E.E.L – Entre Alpes et Tropiques",
      description: "Villa d'exception entre Alpes et jardin tropical.",
      images: [ogImage],
    },
  };
}

async function getHomeData() {
  "use server";

  try {
    const now = new Date();

    const [reviews, activePromo] = await Promise.all([
      prisma.review.findMany({
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      prisma.promoCode.findFirst({
        where: {
          isActive: true,
          OR: [
            { startDate: null, endDate: null },
            {
              startDate: { lte: now },
              endDate: { gte: now },
            },
          ],
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      reviews: reviews.map((r) => ({
        id: r.id,
        guestName: r.guestName,
        rating: r.rating,
        comment: r.comment,
      })),
      promo: activePromo
        ? {
            code: activePromo.code,
            description: activePromo.description,
          }
        : null,
    };
  } catch {
    /* Base de données inaccessible (ex. PostgreSQL non démarré en dev) —
       on retourne des données vides pour ne pas bloquer le rendu. */
    return { reviews: [], promo: null };
  }
}

/* JSON-LD — Schema.org LodgingBusiness pour Google Rich Results */
function JsonLd({ locale }: { locale: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: "Villa R.E.E.L",
    description:
      locale === "en"
        ? "Luxury villa between Alps and tropical garden with heated pool, 6 bedrooms, ideal for holidays and corporate retreats."
        : "Villa de luxe entre Alpes et jardin tropical avec piscine chauffée, 6 chambres, idéale pour séjours et séminaires.",
    url: `https://www.villareel.com/${locale}`,
    image: "https://www.villareel.com/images/hero/hero-banner.jpg",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Reigner-Ésery",
      addressLocality: "Reigner-Ésery",
      postalCode: "74930",
      addressRegion: "Haute-Savoie",
      addressCountry: "FR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 46.138,
      longitude: 6.267,
    },
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Piscine chauffée", value: true },
      { "@type": "LocationFeatureSpecification", name: "Jardin tropical", value: true },
      { "@type": "LocationFeatureSpecification", name: "Billard", value: true },
      { "@type": "LocationFeatureSpecification", name: "Vue Alpes", value: true },
    ],
    numberOfRooms: 6,
    petsAllowed: false,
    checkinTime: "16:00",
    checkoutTime: "10:00",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  const { reviews, promo } = await getHomeData();

  return (
    <>
      <JsonLd locale={locale} />
      <div className="space-y-0">
        <HeroSection locale={locale} />
        <FeaturesSection />
        <GallerySection locale={locale} />
        <ReviewsBanner reviews={reviews} />
        {promo && <PromoSection code={promo.code} description={promo.description ?? undefined} />}
      </div>
    </>
  );
}

