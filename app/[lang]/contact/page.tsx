import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/dictionary";
import { hasLocale } from "@/lib/i18n/config";
import { pageAlternates } from "@/lib/i18n/metadata";
import BusinessInformation from "@/components/sections/contact/BusinessInformation";
import ClosingLine from "@/components/sections/contact/ClosingLine";
import ContactForm from "@/components/sections/contact/ContactForm";
import ContactHero from "@/components/sections/contact/ContactHero";
import ContactIntroduction from "@/components/sections/contact/ContactIntroduction";
import ContactOptions from "@/components/sections/contact/ContactOptions";
import PrivateAppointment from "@/components/sections/contact/PrivateAppointment";
import ShortIntro from "@/components/sections/contact/ShortIntro";
import SocialSection from "@/components/sections/contact/SocialSection";
import AppointmentCTA from "@/components/sections/AppointmentCTA";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { meta } = (await getDictionary()).contact;
  return {
    title: meta.title,
    description: meta.description,
    alternates: pageAlternates("/contact", lang),
  };
}

export default async function ContactPage() {
  const { hero } = (await getDictionary()).contact;
  return (
    <>
      <ContactHero eyebrow={hero.eyebrow} heading={hero.heading} imageAlt={hero.imageAlt} />
      <ContactForm />
      <ContactOptions />
      <ContactIntroduction />
      <PrivateAppointment />
      <BusinessInformation />
      <SocialSection />
      <AppointmentCTA />
    </>
  );
}
