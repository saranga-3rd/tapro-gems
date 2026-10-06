import type { Metadata } from "next";
import LegalDocument from "@/components/sections/legal/LegalDocument";
import LegalHero from "@/components/sections/legal/LegalHero";
import { termsAndConditions } from "@/lib/data/legal/terms";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";
import { pageAlternates } from "@/lib/i18n/metadata";

// The legal documents stay in English in every locale, so fi/sv canonicalise to the English URL.
export async function generateMetadata({ params }: PageProps<"/[lang]/terms">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return {
    title: "Terms & Conditions | Tapro Gems",
    description:
      "The terms governing use of the Tapro Gems website and any enquiries, appointments or services arranged through it.",
    alternates: pageAlternates("/terms", lang, { translated: false }),
  };
}

export default async function TermsPage() {
  const { legal } = await getDictionary();
  return (
    <>
      <LegalHero
        eyebrow={termsAndConditions.eyebrow}
        title={termsAndConditions.title}
        lastUpdated={legal.lastUpdated.replace("{date}", termsAndConditions.lastUpdated)}
        notice={legal.englishOnlyNotice}
        intro={termsAndConditions.intro}
      />
      <LegalDocument sections={termsAndConditions.sections} />
    </>
  );
}
