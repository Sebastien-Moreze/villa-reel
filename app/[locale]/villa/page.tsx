import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { locales } from "@/i18n";
import { getTranslations } from "next-intl/server";

const BASE = "https://www.villareel.com";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";
  const title = isEn ? "The Villa – Villa R.E.E.L" : "La Villa – Villa R.E.E.L";
  const description = isEn
    ? "Discover our luxury villa: 6 bedrooms, heated pool, tropical garden, mountain views and 50+ premium amenities."
    : "Découvrez notre villa de luxe : 6 chambres, piscine chauffée, jardin tropical, vue montagne et 50+ équipements haut de gamme.";
  return {
    title,
    description,
    alternates: { canonical: `${BASE}/${locale}/villa`, languages: { fr: `${BASE}/fr/villa`, en: `${BASE}/en/villa` } },
    openGraph: { title, description, url: `${BASE}/${locale}/villa`, siteName: "Villa R.E.E.L", type: "website", images: [{ url: `${BASE}/images/hero/hero-banner.jpg`, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: [`${BASE}/images/hero/hero-banner.jpg`] },
  };
}
import { AvailabilityCalendar } from "@/components/villa/AvailabilityCalendar";
import { ReviewsBanner } from "@/components/home/ReviewsBanner";
import {
  BedDouble,
  Bath,
  Users,
  Ruler,
  Wifi,
  Thermometer,
  Snowflake,
  Shirt,
  Wind,
  Lock,
  Flame,
  Coffee,
  Utensils,
  UtensilsCrossed,
  Waves,
  Mountain,
  Sun,
  Sofa,
  Umbrella,
  Baby,
  ShowerHead,
  Tv,
  Speaker,
  Dice5,
  BookOpen,
  Target,
  Siren,
  HeartPulse,
  Car,
  PlugZap,
  Accessibility,
  Gift,
  ConciergeBell,
  ChefHat,
  Grape,
  CalendarHeart,
  Sparkles,
  CircleDot,
  type LucideIcon,
} from "lucide-react";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function VillaPage({ params }: PageProps) {
  const villaId = 1;
  const { locale } = await params;
  const t = await getTranslations({ locale });

  const villa = await prisma.villa.findUnique({
    where: { id: villaId },
    include: { amenities: { include: { amenity: true } } },
  });

  const reviews = await prisma.review.findMany({
    where: { status: "APPROVED", villaId },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  if (!villa) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center text-sm text-neutral-700">
        {t("villa.notFound")}
      </div>
    );
  }

  const description =
    locale === "en" ? villa.descriptionEn : villa.descriptionFr;

  return (
    <div className="pb-16">
      {/* Hero */}
      <section className="relative h-[340px] overflow-hidden md:h-[420px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/villa/hero.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />

        <div className="relative z-10 mx-auto flex h-full max-w-6xl items-end px-4 pb-8 md:px-6 md:pb-10">
          <div className="max-w-xl text-white">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-black/35 px-3 py-1 text-[11px] font-medium">
              <span className="text-yellow-300">★★★★★</span>
              <span>{t("villa.badge")}</span>
            </div>
            <h1 className="text-3xl font-semibold uppercase tracking-tight md:text-4xl">
              {locale === "en" ? villa.nameEn : villa.nameFr}
            </h1>
            <p className="mt-2 text-xs text-neutral-100/90 md:text-sm">
              1281 route de Moussy, 74930 Reigner-Esery, France
            </p>
          </div>
        </div>
      </section>

      {/* Main layout */}
      <div className="mx-auto mt-8 flex max-w-6xl flex-col gap-8 px-4 md:flex-row md:px-6">
        {/* Left content */}
        <div className="flex-1 space-y-10">
          <section aria-labelledby="description-title">
            <h2
              id="description-title"
              className="text-lg font-semibold text-neutral-900"
            >
              {t("villa.descriptionTitle")}
            </h2>
            <article className="mt-3 space-y-3 text-sm leading-relaxed text-neutral-700">
              <p>{description}</p>
              <p>{t("villa.descriptionBody")}</p>
            </article>
          </section>

          {/* Key facts */}
          <section aria-label={t("villa.amenitiesTitle")}>
            <div className="grid gap-4 text-xs text-neutral-800 sm:grid-cols-4">
              <div className="flex items-center gap-2 rounded-xl bg-white p-3 shadow-sm">
                <BedDouble className="h-4 w-4 text-primary" />
                <div>
                  <div className="font-semibold">{villa.bedrooms}</div>
                  <div className="text-[11px] text-neutral-500">{t("villa.bedrooms")}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white p-3 shadow-sm">
                <Bath className="h-4 w-4 text-primary" />
                <div>
                  <div className="font-semibold">{villa.bathrooms}</div>
                  <div className="text-[11px] text-neutral-500">{t("villa.bathrooms")}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white p-3 shadow-sm">
                <Users className="h-4 w-4 text-primary" />
                <div>
                  <div className="font-semibold">{villa.maxGuests}</div>
                  <div className="text-[11px] text-neutral-500">{t("villa.maxGuests")}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white p-3 shadow-sm">
                <Ruler className="h-4 w-4 text-primary" />
                <div>
                  <div className="font-semibold">{villa.surface} m²</div>
                  <div className="text-[11px] text-neutral-500">{t("villa.surface")}</div>
                </div>
              </div>
            </div>
          </section>

          {/* Amenities — dynamic from DB */}
          <section aria-labelledby="amenities-title">
            <h2
              id="amenities-title"
              className="text-lg font-semibold text-neutral-900"
            >
              {t("villa.amenitiesTitle")}
            </h2>
            {(() => {
              const categoryLabels: Record<string, { fr: string; en: string }> = {
                essentials: { fr: "Essentiels", en: "Essentials" },
                kitchen: { fr: "Cuisine", en: "Kitchen" },
                outdoor: { fr: "Extérieur & Piscine", en: "Outdoor & Pool" },
                bedroom: { fr: "Chambres & Confort", en: "Bedrooms & Comfort" },
                bathroom: { fr: "Salle de bain", en: "Bathroom" },
                entertainment: { fr: "Divertissement", en: "Entertainment" },
                safety: { fr: "Sécurité", en: "Safety" },
                parking: { fr: "Parking & Accès", en: "Parking & Access" },
                services: { fr: "Services & Extras", en: "Services & Extras" },
              };

              const grouped = villa.amenities.reduce<
                Record<string, typeof villa.amenities>
              >((acc, va) => {
                const cat = va.amenity.category ?? "other";
                if (!acc[cat]) acc[cat] = [];
                acc[cat].push(va);
                return acc;
              }, {});

              const categoryOrder = [
                "essentials", "kitchen", "outdoor", "bedroom",
                "bathroom", "entertainment", "safety", "parking", "services",
              ];

              return (
                <div className="mt-4 space-y-6">
                  {categoryOrder
                    .filter((cat) => grouped[cat]?.length)
                    .map((cat) => (
                      <div key={cat}>
                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                          {locale === "en"
                            ? categoryLabels[cat]?.en ?? cat
                            : categoryLabels[cat]?.fr ?? cat}
                        </h3>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {grouped[cat].map((va) => (
                            <AmenityItem
                              key={va.amenity.key}
                              icon={
                                <AmenityIcon
                                  name={va.amenity.icon ?? "circle"}
                                  className="h-4 w-4"
                                />
                              }
                              label={
                                locale === "en"
                                  ? va.amenity.labelEn
                                  : va.amenity.labelFr
                              }
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              );
            })()}
          </section>

          {/* Calendar & availability */}
          <section aria-labelledby="calendar-title" className="space-y-4">
            <div>
              <h2
                id="calendar-title"
                className="text-lg font-semibold text-neutral-900"
              >
                {t("villa.availabilityTitle")}
              </h2>
              <p className="mt-1 text-xs text-neutral-600">
                {t("villa.availabilityDesc")}
              </p>
            </div>
            <AvailabilityCalendar villaId={villaId} />
          </section>

          {/* Map */}
          <section aria-labelledby="map-title" className="space-y-3">
            <h2
              id="map-title"
              className="text-lg font-semibold text-neutral-900"
            >
              {t("villa.locationTitle")}
            </h2>
            <p className="text-xs text-neutral-600">
              {t("villa.locationDesc")}
            </p>
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100">
              <iframe
                title="Carte Villa R.E.E.L"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2775.911967544695!2d6.262!3d46.153!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x478c1f8d0b7f5a6b%3A0x0!2sReignier-Esery!5e0!3m2!1sfr!2sfr!4v1700000000000"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-64 w-full border-0"
              />
            </div>
          </section>

          {/* Reviews for this villa */}
          {reviews.length > 0 && (
            <section aria-label="Reviews" className="mt-6">
              <ReviewsBanner
                reviews={reviews.map((r) => ({
                  id: r.id,
                  guestName: r.guestName,
                  rating: r.rating,
                  comment: r.comment,
                }))}
              />
            </section>
          )}
        </div>

        {/* Sticky booking card */}
        <aside className="w-full md:w-[320px]">
          <div className="sticky top-24 rounded-2xl border border-neutral-200 bg-white p-5 shadow-md">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-semibold text-neutral-900">
                {villa.pricePerNight.toString()} €
              </span>
              <span className="text-xs text-neutral-500">{t("villa.perNight")}</span>
            </div>

            <BookingCalculator
              villaId={villaId}
              pricePerNight={Number(villa.pricePerNight)}
              cleaningFee={Number(villa.cleaningFee)}
              deposit={Number(villa.deposit)}
              labels={{
                checkIn: t("villa.bookingCheckIn"),
                checkOut: t("villa.bookingCheckOut"),
                cleaning: t("villa.bookingCleaning"),
                depositLabel: t("villa.bookingDeposit"),
                total: t("villa.bookingTotal"),
                cta: t("villa.bookingCta"),
                note: t("villa.bookingNote"),
              }}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

const iconMap: Record<string, LucideIcon> = {
  wifi: Wifi,
  thermometer: Thermometer,
  snowflake: Snowflake,
  shirt: Shirt,
  wind: Wind,
  lock: Lock,
  flame: Flame,
  coffee: Coffee,
  utensils: Utensils,
  "utensils-crossed": UtensilsCrossed,
  waves: Waves,
  mountain: Mountain,
  sun: Sun,
  sofa: Sofa,
  umbrella: Umbrella,
  baby: Baby,
  "shower-head": ShowerHead,
  bath: Bath,
  tv: Tv,
  speaker: Speaker,
  "dice-5": Dice5,
  "book-open": BookOpen,
  target: Target,
  siren: Siren,
  "heart-pulse": HeartPulse,
  car: Car,
  "plug-zap": PlugZap,
  accessibility: Accessibility,
  gift: Gift,
  "concierge-bell": ConciergeBell,
  "chef-hat": ChefHat,
  grape: Grape,
  "calendar-heart": CalendarHeart,
  sparkles: Sparkles,
  "circle-dot": CircleDot,
  "bed-double": BedDouble,
  "palm-tree": Sun,
  "cooking-pot": Flame,
  microwave: Flame,
  refrigerator: Snowflake,
  "thermometer-snowflake": Snowflake,
  "cup-soda": Coffee,
  sandwich: Flame,
  wine: Grape,
  armchair: Sofa,
  "picnic-table": Sofa,
  "flame-kindling": Flame,
  "rocking-chair": Sofa,
  lamp: Sun,
  blinds: Wind,
  pillow: BedDouble,
  wardrobe: Lock,
  "pump-soap": Sparkles,
  hanger: Shirt,
  bed: BedDouble,
  iron: Flame,
  cctv: Siren,
  fence: Lock,
};

function AmenityIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name] ?? CircleDot;
  return <Icon className={className} />;
}

type AmenityItemProps = {
  icon: React.ReactNode;
  label: string;
};

function AmenityItem({ icon, label }: AmenityItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <span className="text-xs font-medium text-neutral-800">{label}</span>
    </div>
  );
}

type BookingLabels = {
  checkIn: string;
  checkOut: string;
  cleaning: string;
  depositLabel: string;
  total: string;
  cta: string;
  note: string;
};

type BookingCalculatorProps = {
  villaId: number;
  pricePerNight: number;
  cleaningFee: number;
  deposit: number;
  labels: BookingLabels;
};

function BookingCalculator({
  villaId,
  pricePerNight,
  cleaningFee,
  deposit,
  labels,
}: BookingCalculatorProps) {
  const searchParams = new URLSearchParams();
  searchParams.set("villaId", String(villaId));

  const reservationUrl = `/reservation?${searchParams.toString()}`;

  return (
    <div className="mt-4 space-y-4 text-xs text-neutral-700">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-neutral-500">
            {labels.checkIn}
          </label>
          <input
            type="date"
            className="rounded-lg border border-neutral-200 px-2 py-1.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-neutral-500">
            {labels.checkOut}
          </label>
          <input
            type="date"
            className="rounded-lg border border-neutral-200 px-2 py-1.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="rounded-xl bg-neutral-50 p-3 text-[11px] text-neutral-700">
        <div className="flex items-center justify-between">
          <span>{pricePerNight} € x 1 nuit</span>
          <span>{pricePerNight} €</span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span>{labels.cleaning}</span>
          <span>{cleaningFee} €</span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span>{labels.depositLabel}</span>
          <span>{deposit} €</span>
        </div>
        <div className="mt-2 border-t border-neutral-200 pt-2 font-semibold text-neutral-900">
          <div className="flex items-center justify-between">
            <span>{labels.total}</span>
            <span>{pricePerNight + cleaningFee + deposit} €</span>
          </div>
        </div>
      </div>

      <a
        href={reservationUrl}
        className="inline-flex w-full items-center justify-center rounded-full bg-cta px-4 py-2.5 text-xs font-semibold text-white shadow-md transition hover:shadow-lg"
      >
        {labels.cta}
      </a>

      <p className="text-[10px] text-neutral-500">
        {labels.note}
      </p>
    </div>
  );
}
