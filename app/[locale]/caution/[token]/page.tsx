import { Metadata } from "next";
import CautionClientPage from "./CautionClientPage";

export const metadata: Metadata = {
  title: "Autorisation de caution – Villa R.E.E.L",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ locale: string; token: string }>;
};

export default async function CautionPage({ params }: Props) {
  const { locale, token } = await params;
  return <CautionClientPage token={token} locale={locale} />;
}
