import type { Metadata } from "next";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary, getDictionaryFor } from "@/lib/i18n/dictionary";
import { pageAlternates } from "@/lib/i18n/metadata";
import ShopGrid from "@/components/sections/shop/ShopGrid";
import ShopHero from "@/components/sections/shop/ShopHero";
import EveryOccasion from "@/components/sections/EveryOccasion";
import PrivateAppointment from "@/components/sections/contact/PrivateAppointment";
import AppointmentCTA from "@/components/sections/AppointmentCTA";

export async function generateMetadata({ params }: PageProps<"/[lang]/shop">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { meta } = (await getDictionaryFor(lang)).shop;
  return {
    title: meta.title,
    description: meta.description,
    alternates: pageAlternates("/shop", lang),
  };
}

export default async function ShopPage() {
  const t = (await getDictionary()).shop;
  return (
    <>
      <ShopHero t={t.hero} />
      <ShopGrid />
      <EveryOccasion />
      <PrivateAppointment />
      <AppointmentCTA />
    </>
  );
}
