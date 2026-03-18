import {getRequestConfig} from "next-intl/server";

export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale;
  const safeLocale = requested === "en" ? "en" : "fr";
  const messages = (await import(`./messages/${safeLocale}.json`)).default;

  return {
    locale: safeLocale,
    messages
  };
});

