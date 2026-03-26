import type { Metadata } from "next";
import type { ReactNode } from "react";

const BASE = "https://www.villareel.com";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";
  const title = isEn ? "Book Your Stay – Villa R.E.E.L" : "Réserver – Villa R.E.E.L";
  const description = isEn
    ? "Book your stay at Villa R.E.E.L: choose dates, number of guests and pay securely online."
    : "Réservez votre séjour à la Villa R.E.E.L : choisissez vos dates, nombre de voyageurs et payez en ligne en toute sécurité.";
  return {
    title,
    description,
    alternates: {
      canonical: `${BASE}/${locale}/reservation`,
      languages: { fr: `${BASE}/fr/reservation`, en: `${BASE}/en/reservation` },
    },
    openGraph: { title, description, url: `${BASE}/${locale}/reservation`, siteName: "Villa R.E.E.L", type: "website" },
    robots: { index: false },
  };
}

export default function ReservationLayout({ children }: Props) {
  return children;
}
