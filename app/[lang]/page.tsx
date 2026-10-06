import type { Metadata } from "next";
import AppointmentCTA from "@/components/sections/AppointmentCTA";
import BrandIntro from "@/components/sections/BrandIntro";
import Certification from "@/components/sections/Certification";
import CinematicStory from "@/components/sections/CinematicStory";
import CollectionsBanner from "@/components/sections/CollectionsBanner";
import CollectorsPanel from "@/components/sections/CollectorsPanel";
import EveryOccasion from "@/components/sections/EveryOccasion";
import ExploreCategories from "@/components/sections/ExploreCategories";
import FinlandNow from "@/components/sections/FinlandNow";
import FeaturedGemstones from "@/components/sections/FeaturedGemstones";
import FounderStory from "@/components/sections/FounderStory";
import HeroSection from "@/components/sections/HeroSection";
import WhyTapro from "@/components/sections/WhyTapro";
import JsonLd from "@/components/seo/JsonLd";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";
import { pageAlternates } from "@/lib/i18n/metadata";
import { homeStructuredData } from "@/lib/structured-data";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return { alternates: pageAlternates("/", lang) };
}

export default async function Home() {
  const dict = await getDictionary();
  return (
    <>
      <JsonLd data={homeStructuredData} />
      <HeroSection content={dict.home.hero} />
      <FinlandNow />
      <BrandIntro content={dict.home.brandIntro} />
      <FeaturedGemstones />
      <WhyTapro />
      <EveryOccasion />
      <CollectionsBanner />
      <ExploreCategories />
      <CinematicStory />
      <CollectorsPanel />
      <Certification />
      {/* / */}
      <AppointmentCTA />
    </>
  );
}
