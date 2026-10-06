import type { Metadata } from "next";
import AppointmentCTA from "@/components/sections/AppointmentCTA";
import CollectionsGallery from "@/components/sections/collections/CollectionsGallery";
import CollectionsHero from "@/components/sections/collections/CollectionsHero";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary, getDictionaryFor } from "@/lib/i18n/dictionary";
import { pageAlternates } from "@/lib/i18n/metadata";

export async function generateMetadata({ params }: PageProps<"/[lang]/collections">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { meta } = (await getDictionaryFor(lang)).collections;
  return {
    title: meta.title,
    description: meta.description,
    alternates: pageAlternates("/collections", lang),
  };
}

export default async function CollectionsPage() {
  const { hero } = (await getDictionary()).collections;
  return (
    <>
      <CollectionsHero
        imageAlt={hero.imageAlt}
        eyebrow={hero.eyebrow}
        heading={hero.heading}
        text={hero.text}
      />
      <CollectionsGallery />
      <AppointmentCTA />
    </>
  );
}
