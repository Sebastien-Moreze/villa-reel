import type { Metadata } from "next";
import { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/layout/BackToTop";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { ReservationProvider } from "@/components/reservation/ReservationContext";
import { ReservationDrawer } from "@/components/reservation/ReservationDrawer";
import { AvailabilityModal } from "@/components/availability/AvailabilityModal";

export const metadata: Metadata = {
  title: "Villa R.E.E.L",
  description:
    "Villa d'exception pour séjours, événements d'entreprise et collaborations créatives.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};
export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  const messages = (await import(`@/messages/${locale === "en" ? "en" : "fr"}.json`)).default;


  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ToastProvider>
        <ReservationProvider>
          <div className="flex min-h-screen flex-col bg-background text-neutral-900" lang={locale}>
            <Navbar locale={locale} />
            <main className="flex-1 pt-20">{children}</main>
            <Footer />
            <BackToTop />
            <ReservationDrawer />
            <AvailabilityModal />
          </div>
        </ReservationProvider>
      </ToastProvider>
    </NextIntlClientProvider>
  );
}

