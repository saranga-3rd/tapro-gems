import type { Metadata } from "next";
import LegalDocument from "@/components/sections/legal/LegalDocument";
import LegalHero from "@/components/sections/legal/LegalHero";
import { cookiePolicy } from "@/lib/data/legal/cookies";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";
import { pageAlternates } from "@/lib/i18n/metadata";

// The legal documents stay in English in every locale, so fi/sv canonicalise to the English URL.
export async function generateMetadata({ params }: PageProps<"/[lang]/cookies">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return {
    title: "Cookie Policy | Tapro Gems",
    description:
      "How Tapro Gems uses cookies and similar technologies on our website, and how to manage your preferences.",
    alternates: pageAlternates("/cookies", lang, { translated: false }),
  };
}

export default async function CookiesPage() {
  const { legal } = await getDictionary();
  return (
    <>
      <LegalHero
        eyebrow={cookiePolicy.eyebrow}
        title={cookiePolicy.title}
        lastUpdated={legal.lastUpdated.replace("{date}", cookiePolicy.lastUpdated)}
        notice={legal.englishOnlyNotice}
        intro={cookiePolicy.intro}
      />
      <LegalDocument sections={cookiePolicy.sections} />
    </>
  );
}
