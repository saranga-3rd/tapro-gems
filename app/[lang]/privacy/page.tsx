import type { Metadata } from "next";
import LegalDocument from "@/components/sections/legal/LegalDocument";
import LegalHero from "@/components/sections/legal/LegalHero";
import { privacyPolicy } from "@/lib/data/legal/privacy";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";
import { pageAlternates } from "@/lib/i18n/metadata";

// The legal documents stay in English in every locale, so fi/sv canonicalise to the English URL.
export async function generateMetadata({ params }: PageProps<"/[lang]/privacy">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return {
    title: "Privacy Policy | Tapro Gems",
    description:
      "How Tapro Gems collects, uses, stores and protects personal information when you visit our website or contact us.",
    alternates: pageAlternates("/privacy", lang, { translated: false }),
  };
}

export default async function PrivacyPage() {
  const { legal } = await getDictionary();
  return (
    <>
      <LegalHero
        eyebrow={privacyPolicy.eyebrow}
        title={privacyPolicy.title}
        lastUpdated={legal.lastUpdated.replace("{date}", privacyPolicy.lastUpdated)}
        notice={legal.englishOnlyNotice}
        intro={privacyPolicy.intro}
      />
      <LegalDocument sections={privacyPolicy.sections} />
    </>
  );
}
