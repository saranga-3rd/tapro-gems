export const locales = ["en", "fi", "sv"] as const;
export type Locale = (typeof locales)[number];

/** English is served without a prefix (/about); the others live under /fi and /sv. */
export const defaultLocale: Locale = "en";

export const LOCALE_COOKIE = "NEXT_LOCALE";

export const SITE_URL = "https://www.taprogems.fi";

export const localeInfo: Record<Locale, { short: string; name: string; hreflang: string; ogLocale: string }> = {
  en: { short: "EN", name: "English", hreflang: "en", ogLocale: "en_GB" },
  fi: { short: "FI", name: "Suomi", hreflang: "fi", ogLocale: "fi_FI" },
  sv: { short: "SV", name: "Svenska", hreflang: "sv", ogLocale: "sv_FI" },
};

export function hasLocale(value: string | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

const isInternal = (href: string) => href.startsWith("/") && !href.startsWith("//");

/** Prefixes an internal path with the locale ("/about#x" -> "/fi/about#x"). Other hrefs pass through. */
export function localizePath(href: string, locale: Locale): string {
  if (!isInternal(href) || locale === defaultLocale) return href;
  const match = /^([^?#]*)(.*)$/.exec(href)!;
  const [, pathname, rest] = match;
  return `${pathname === "/" ? `/${locale}` : `/${locale}${pathname}`}${rest}`;
}

/**
 * Splits "/fi/about" into { locale: "fi", path: "/about" }; unprefixed paths are English.
 * "/en/..." is also accepted: in production, statically rendered English pages can report their
 * internal rewritten path (/en) from usePathname instead of the visible URL.
 */
export function parsePathname(pathname: string): { locale: Locale; path: string } {
  const [, first, ...rest] = pathname.split("/");
  if (hasLocale(first)) {
    return { locale: first, path: `/${rest.join("/")}` };
  }
  return { locale: defaultLocale, path: pathname || "/" };
}

/** Absolute URL for a path in a locale. The English home is the bare origin, matching its canonical. */
export function absoluteUrl(path: string, locale: Locale = defaultLocale): string {
  const localized = localizePath(path, locale);
  return localized === "/" ? SITE_URL : `${SITE_URL}${localized}`;
}
