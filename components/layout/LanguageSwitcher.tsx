'use client';

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n";

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (nextLocale: Locale) => {
    if (nextLocale === locale) return;
    const segments = pathname.split("/");
    segments[1] = nextLocale;
    const nextPath = segments.join("/") || "/";
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=${
      60 * 60 * 24 * 365
    }`;
    router.replace(nextPath);
  };

  return (
    <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-white/60 px-2 py-1 text-xs font-medium text-neutral-700 shadow-sm">
      <button
        type="button"
        onClick={() => switchLocale("fr")}
        className={`rounded-full px-2 py-1 ${
          locale === "fr"
            ? "bg-primary text-white"
            : "text-neutral-700 hover:bg-primary/10"
        }`}
      >
        FR
      </button>
      <button
        type="button"
        onClick={() => switchLocale("en")}
        className={`rounded-full px-2 py-1 ${
          locale === "en"
            ? "bg-primary text-white"
            : "text-neutral-700 hover:bg-primary/10"
        }`}
      >
        EN
      </button>
    </div>
  );
}

