import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/dictionary";
import { hasLocale } from "@/lib/i18n/config";
import { pageAlternates } from "@/lib/i18n/metadata";
import { getGemstones } from "@/lib/store";
import AppointmentForm from "@/components/sections/appointment/AppointmentForm";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/appointment">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { meta } = (await getDictionary()).appointment;
  return {
    title: meta.title,
    description: meta.description,
    alternates: pageAlternates("/appointment", lang),
  };
}

export default async function AppointmentPage() {
  return <AppointmentForm gemstones={await getGemstones()} />;
}
