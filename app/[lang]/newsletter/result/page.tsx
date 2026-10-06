import type { Metadata } from "next";
import ResultMessage from "@/components/newsletter/ResultMessage";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionaryFor } from "@/lib/i18n/dictionary";

export async function generateMetadata({ params }: PageProps<"/[lang]/newsletter/result">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { newsletter } = await getDictionaryFor(lang);
  return { title: newsletter.resultMeta.title, robots: { index: false, follow: false } };
}

/** Display only. Visiting this URL never changes subscription state. */
export default async function ResultPage({ searchParams }: PageProps<"/[lang]/newsletter/result">) {
  const raw = (await searchParams).status;
  return <ResultMessage status={typeof raw === "string" ? raw : "invalid"} />;
}
