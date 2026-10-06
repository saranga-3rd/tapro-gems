import type { Metadata } from "next";
import { defaultLocale, localeInfo, localizePath, locales, type Locale } from "./config";

/**
 * Canonical + hreflang alternates for a page.
 * - `translated: true` (default): the page exists in all three languages, each is its own canonical.
 * - `translated: false`: content is English-only; fi/sv copies canonicalise to the English URL
 *   and no hreflang cluster is emitted.
 */
export function pageAlternates(
  path: string,
  locale: Locale,
  { translated = true }: { translated?: boolean } = {},
): NonNullable<Metadata["alternates"]> {
  if (!translated) return { canonical: path };

  const languages: Record<string, string> = Object.fromEntries(
    locales.map((l) => [localeInfo[l].hreflang, localizePath(path, l)]),
  );
  languages["x-default"] = localizePath(path, defaultLocale);
  return { canonical: localizePath(path, locale), languages };
}
