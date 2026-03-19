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

  if (locale === "en") {
    return {
      title: "Villa R.E.E.L – Between Alps and Tropics",
      description:
        "Exceptional villa between Alps and tropical garden for stays, corporate events and creative collaborations.",
      openGraph: {
        title: "Villa R.E.E.L – Between Alps and Tropics",
        description:
          "A unique villa near the Alps with heated pool and tropical garden, ideal for holidays and corporate retreats.",
        type: "website",
      },
    };
  }

  return {
    title: "Villa R.E.E.L – Entre Alpes et Tropiques",
    description:
      "Villa d'exception entre Alpes et jardin tropical pour séjours, événements d'entreprise et collaborations créatives.",
    openGraph: {
      title: "Villa R.E.E.L – Entre Alpes et Tropiques",
      description:
        "Une villa unique proche des Alpes avec piscine chauffée et jardin tropical, idéale pour vos séjours et séminaires.",
      type: "website",
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

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  const { reviews, promo } = await getHomeData();

  return (
    <div className="space-y-0">
      <HeroSection locale={locale} />
      <FeaturesSection />
      <GallerySection locale={locale} />
      <ReviewsBanner reviews={reviews} />
      {promo && <PromoSection code={promo.code} description={promo.description ?? undefined} />}
    </div>
  );
}

