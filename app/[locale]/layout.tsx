import type { Metadata } from "next";
import { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/components/providers/ToastProvider";

export const metadata: Metadata = {
  title: "Villa R.E.E.L",
  description:
    "Villa d'exception pour séjours, événements d'entreprise et collaborations créatives.",
};

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};
export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  const messages = await getMessages();


  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ToastProvider>
        <div className="flex min-h-screen flex-col bg-background text-neutral-900">
          <Navbar locale={locale} />
          <main className="flex-1 pt-20">{children}</main>
          <Footer />
        </div>
      </ToastProvider>
    </NextIntlClientProvider>
  );
}

