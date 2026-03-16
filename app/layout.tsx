import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Villa R.E.E.L",
  description: "Villa d'exception pour séjours, événements et collaborations.",
};

export default function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  return (
    <html lang={params.locale ?? "fr"}>
      <body
        className={`${playfair.variable} ${montserrat.variable} antialiased bg-background text-neutral-900 font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
