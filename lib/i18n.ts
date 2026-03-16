import { getTranslations } from "next-intl/server";
import { locales, defaultLocale, type Locale } from "@/i18n";

export { locales, defaultLocale };
export type { Locale };

export async function getServerTranslations(
  locale: Locale,
  namespace?: string,
) {
  return getTranslations({ locale, namespace });
}

