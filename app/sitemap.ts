import type { MetadataRoute } from "next";
import { absoluteUrl, localeInfo, locales } from "@/lib/i18n/config";
import { getGemstones } from "@/lib/catalog";

export const revalidate = 3600;

/** Pages that exist in every language. Each locale gets its own entry with hreflang alternates. */
const translatedPaths = [
  "/",
  "/about",
  "/appointment",
  "/collections",
  "/contact",
  "/gallery",
  "/shop",
];

/** Legal documents are English-only: fi/sv copies canonicalise to the English URL, so only it is listed. */
const englishOnlyPaths = ["/cookies", "/privacy", "/terms"];

function translatedEntries(path: string): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    locales.map((locale) => [localeInfo[locale].hreflang, absoluteUrl(path, locale)]),
  );
  languages["x-default"] = absoluteUrl(path);
  return locales.map((locale) => ({ url: absoluteUrl(path, locale), alternates: { languages } }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // /shop/[id] renders every gemstone in the store (there is no draft state), keyed by slug.
  const slugs = new Set(
    (await getGemstones()).map((gemstone) => gemstone.slug).filter(Boolean),
  );

  return [
    ...translatedPaths.flatMap(translatedEntries),
    ...englishOnlyPaths.map((path) => ({ url: absoluteUrl(path) })),
    ...[...slugs].flatMap((slug) => translatedEntries(`/shop/${encodeURIComponent(slug)}`)),
  ];
}
