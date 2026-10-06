import type { Dictionary } from "@/messages/en";
import type { Locale } from "./config";
import { getLocale } from "./locale";

const loaders: Record<Locale, () => Promise<{ default: Dictionary }>> = {
  en: () => import("@/messages/en"),
  fi: () => import("@/messages/fi"),
  sv: () => import("@/messages/sv"),
};

export type { Dictionary };

export async function getDictionaryFor(locale: Locale): Promise<Dictionary> {
  return (await loaders[locale]()).default;
}

/** Dictionary for the current request. Server Components only. */
export async function getDictionary(): Promise<Dictionary> {
  return getDictionaryFor(await getLocale());
}

/** Namespaces sent to the browser for Client Components. Everything else stays on the server. */
export const CLIENT_NAMESPACES = ["common", "nav", "contactForm", "appointmentForm", "newsletter"] as const;
export type ClientDictionary = Pick<Dictionary, (typeof CLIENT_NAMESPACES)[number]>;

export function pickClientDictionary(dictionary: Dictionary): ClientDictionary {
  return Object.fromEntries(CLIENT_NAMESPACES.map((ns) => [ns, dictionary[ns]])) as ClientDictionary;
}
