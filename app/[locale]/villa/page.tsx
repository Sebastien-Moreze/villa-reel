import { prisma } from "@/lib/prisma";
import { locales } from "@/i18n";
import { AvailabilityCalendar } from "@/components/villa/AvailabilityCalendar";
import { ReviewsBanner } from "@/components/home/ReviewsBanner";
import {
  BedDouble,
  Bath,
  Users,
  Ruler,
  Waves,
  Mountain,
  Trees,
  CpuIcon,
} from "lucide-react";

export const dynamic = "force-dynamic";

type PageProps = {
  params: { locale: string };
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function VillaPage({ params }: PageProps) {
  const villaId = 1;
  const { locale } = params;

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
        Villa introuvable.
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
              <span>Villa d&apos;exception</span>
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
              {locale === "en" ? "Description" : "Description de la villa"}
            </h2>
            <article className="mt-3 space-y-3 text-sm leading-relaxed text-neutral-700">
              <p>{description}</p>
              <p>
                Entre montagnes et jardin luxuriant, la Villa R.E.E.L offre
                plusieurs espaces de vie, une piscine chauffée, un jardin
                tropical et des vues dégagées sur la chaîne alpine. Un lieu
                pensé pour les familles, les retraites d&apos;équipe et les
                événements intimistes.
              </p>
            </article>
          </section>

          {/* Key facts */}
          <section aria-label="Caractéristiques principales">
            <div className="grid gap-4 text-xs text-neutral-800 sm:grid-cols-4">
              <div className="flex items-center gap-2 rounded-xl bg-white p-3 shadow-sm">
                <BedDouble className="h-4 w-4 text-primary" />
                <div>
                  <div className="font-semibold">{villa.bedrooms}</div>
                  <div className="text-[11px] text-neutral-500">Chambres</div>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white p-3 shadow-sm">
                <Bath className="h-4 w-4 text-primary" />
                <div>
                  <div className="font-semibold">{villa.bathrooms}</div>
                  <div className="text-[11px] text-neutral-500">Salles d&apos;eau</div>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white p-3 shadow-sm">
                <Users className="h-4 w-4 text-primary" />
                <div>
                  <div className="font-semibold">{villa.maxGuests}</div>
                  <div className="text-[11px] text-neutral-500">Voyageurs max</div>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white p-3 shadow-sm">
                <Ruler className="h-4 w-4 text-primary" />
                <div>
                  <div className="font-semibold">{villa.surface} m²</div>
                  <div className="text-[11px] text-neutral-500">Surface</div>
                </div>
              </div>
            </div>
          </section>

          {/* Amenities */}
          <section aria-labelledby="amenities-title">
            <h2
              id="amenities-title"
              className="text-lg font-semibold text-neutral-900"
            >
              Équipements & atmosphère
            </h2>
            <div className="mt-4 grid gap-3 text-xs text-neutral-700 sm:grid-cols-2">
              <AmenityItem icon={<Waves className="h-4 w-4" />} label="Piscine chauffée" />
              <AmenityItem icon={<Mountain className="h-4 w-4" />} label="Vue Mont-Blanc" />
              <AmenityItem icon={<Trees className="h-4 w-4" />} label="Jardin tropical" />
              <AmenityItem icon={<CpuIcon className="h-4 w-4" />} label="Billard & espace lounge" />
            </div>
          </section>

          {/* Calendar & availability */}
          <section aria-labelledby="calendar-title" className="space-y-4">
            <div>
              <h2
                id="calendar-title"
                className="text-lg font-semibold text-neutral-900"
              >
                Disponibilités
              </h2>
              <p className="mt-1 text-xs text-neutral-600">
                Visualisez en un coup d&apos;œil les périodes disponibles pour
                planifier votre séjour.
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
              Localisation
            </h2>
            <p className="text-xs text-neutral-600">
              La localisation précise est communiquée après confirmation de la
              réservation. La carte ci-dessous indique la commune environnante.
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
            <section aria-label="Avis des clients" className="mt-6">
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
              <span className="text-xs text-neutral-500">/ nuit</span>
            </div>

            <BookingCalculator
              villaId={villaId}
              pricePerNight={Number(villa.pricePerNight)}
              cleaningFee={Number(villa.cleaningFee)}
              deposit={Number(villa.deposit)}
            />
          </div>
        </aside>
      </div>
    </div>
  );
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

type BookingCalculatorProps = {
  villaId: number;
  pricePerNight: number;
  cleaningFee: number;
  deposit: number;
};

function BookingCalculator({
  villaId,
  pricePerNight,
  cleaningFee,
  deposit,
}: BookingCalculatorProps) {
  const searchParams = new URLSearchParams();
  searchParams.set("villaId", String(villaId));

  const reservationUrl = `/reservation?${searchParams.toString()}`;

  return (
    <div className="mt-4 space-y-4 text-xs text-neutral-700">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-neutral-500">
            Arrivée
          </label>
          <input
            type="date"
            className="rounded-lg border border-neutral-200 px-2 py-1.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-neutral-500">
            Départ
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
          <span>Ménage</span>
          <span>{cleaningFee} €</span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span>Caution</span>
          <span>{deposit} €</span>
        </div>
        <div className="mt-2 border-t border-neutral-200 pt-2 font-semibold text-neutral-900">
          <div className="flex items-center justify-between">
            <span>Total estimé</span>
            <span>{pricePerNight + cleaningFee + deposit} €</span>
          </div>
        </div>
      </div>

      <a
        href={reservationUrl}
        className="inline-flex w-full items-center justify-center rounded-full bg-cta px-4 py-2.5 text-xs font-semibold text-white shadow-md transition hover:shadow-lg"
      >
        Réserver
      </a>

      <p className="text-[10px] text-neutral-500">
        Le montant exact sera calculé en fonction de vos dates, du nombre de
        nuits et des éventuelles promotions en cours.
      </p>
    </div>
  );
}

