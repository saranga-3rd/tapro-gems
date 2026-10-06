"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { ClientDictionary } from "@/lib/i18n/dictionary";

interface LocaleContextValue {
  locale: Locale;
  dictionary: ClientDictionary;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export default function LocaleProvider({
  locale,
  dictionary,
  children,
}: LocaleContextValue & { children: ReactNode }) {
  return <LocaleContext value={{ locale, dictionary }}>{children}</LocaleContext>;
}

function useLocaleContext() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("LocaleProvider is missing");
  return value;
}

export const useLocale = () => useLocaleContext().locale;

/** Client-side dictionary: only the namespaces in CLIENT_NAMESPACES. */
export const useDictionary = () => useLocaleContext().dictionary;
