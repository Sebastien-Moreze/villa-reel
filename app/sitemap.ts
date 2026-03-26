import type { MetadataRoute } from "next";

const BASE_URL = "https://www.villareel.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ["fr", "en"];

  const pages = [
    "",
    "/villa",
    "/galerie",
    "/entreprises",
    "/evenements",
    "/collaborateurs",
    "/contact",
    "/reservation",
    "/cgv",
    "/confidentialite",
    "/mentions-legales",
    "/reglement-interieur",
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const page of pages) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === "" ? "weekly" : "monthly",
        priority: page === "" ? 1.0 : page === "/villa" ? 0.9 : 0.7,
      });
    }
  }

  return entries;
}
