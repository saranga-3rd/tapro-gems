"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LOCALE_COOKIE,
  localeInfo,
  localizePath,
  locales,
  parsePathname,
  type Locale,
} from "@/lib/i18n/config";
import { useDictionary, useLocale } from "./LocaleProvider";

interface LanguageSwitcherProps {
  /** "dark" is for use over the transparent hero header. */
  tone?: "light" | "dark";
  className?: string;
}

function rememberLocale(locale: Locale) {
  // Read by proxy.ts so unprefixed URLs open in the visitor's chosen language.
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

/** Switches the current page to another language, keeping the same path. */
export default function LanguageSwitcher({ tone = "light", className = "" }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const current = useLocale();
  const { nav } = useDictionary();
  const { path } = parsePathname(pathname);

  return (
    <ul
      aria-label={nav.languageLabel}
      className={`flex items-center gap-0.5 text-xs font-medium tracking-wide ${className}`}
    >
      {locales.map((locale) => {
        const active = locale === current;
        const idle =
          tone === "dark" ? "text-ivory/70 hover:text-gold-300" : "text-ink-muted/70 hover:text-ink";
        return (
          <li key={locale}>
            <Link
              href={localizePath(path, locale)}
              hrefLang={localeInfo[locale].hreflang}
              lang={locale}
              title={localeInfo[locale].name}
              aria-label={localeInfo[locale].name}
              aria-current={active ? "true" : undefined}
              onClick={() => rememberLocale(locale)}
              className={`rounded-full px-2 py-1 transition-colors ${
                active ? (tone === "dark" ? "text-gold-300" : "text-gold-600") : idle
              }`}
            >
              {localeInfo[locale].short}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
