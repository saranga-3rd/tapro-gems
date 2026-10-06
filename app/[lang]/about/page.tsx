import type { Metadata } from "next";
import AboutHero from "@/components/sections/about/AboutHero";
import CertificationTrust from "@/components/sections/about/CertificationTrust";
import FamilyOwned from "@/components/sections/about/FamilyOwned";
import NaturalGemstones from "@/components/sections/about/NaturalGemstones";
import OurApproach from "@/components/sections/about/OurApproach";
import OurStory from "@/components/sections/about/OurStory";
import OurTeam from "@/components/sections/about/OurTeam";
import OurVision from "@/components/sections/about/OurVision";
import ShortIntro from "@/components/sections/about/ShortIntro";
import WhatWeOffer from "@/components/sections/about/WhatWeOffer";
import AppointmentCTA from "@/components/sections/AppointmentCTA";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary, getDictionaryFor } from "@/lib/i18n/dictionary";
import { pageAlternates } from "@/lib/i18n/metadata";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { meta } = (await getDictionaryFor(lang)).about;
  return {
    title: meta.title,
    description: meta.description,
    alternates: pageAlternates("/about", lang),
  };
}

export default async function AboutPage() {
  const { hero, intro } = (await getDictionary()).about;
  return (
    <>
      <AboutHero imageAlt={hero.imageAlt} eyebrow={hero.eyebrow} heading={hero.heading} />
      <ShortIntro
        watermarkNatural={intro.watermarkNatural}
        watermarkTrusted={intro.watermarkTrusted}
        text={intro.text}
      />
      <OurStory />
      <OurTeam />
      <WhatWeOffer />
      <NaturalGemstones />
      <CertificationTrust />
      <FamilyOwned />
      <OurApproach />
      <OurVision />
      <AppointmentCTA />
    </>
  );
}
