import type { Metadata } from "next";
import ResultMessage from "@/components/newsletter/ResultMessage";
import StatusCard from "@/components/newsletter/StatusCard";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionaryFor } from "@/lib/i18n/dictionary";
import { inspectToken } from "@/lib/newsletter/subscribers";
import { confirmNewsletterAction } from "../actions";

export async function generateMetadata({ params }: PageProps<"/[lang]/newsletter/confirm">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { newsletter } = await getDictionaryFor(lang);
  return { title: newsletter.confirm.meta.title, robots: { index: false, follow: false } };
}

export default async function ConfirmPage({ params, searchParams }: PageProps<"/[lang]/newsletter/confirm">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return null;
  const { newsletter } = await getDictionaryFor(lang);
  const t = newsletter.confirm;
  const raw = (await searchParams).token;
  const token = typeof raw === "string" ? raw : "";
  let state: Awaited<ReturnType<typeof inspectToken>> | "error" = "invalid";
  try {
    state = await inspectToken(token);
  } catch {
    state = "error";
  }

  if (state === "valid") {
    return (
      <StatusCard eyebrow={t.eyebrow} title={t.title}>
        <p className="mb-6">{t.body}</p>
        <form action={confirmNewsletterAction}>
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="locale" value={lang} />
          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center rounded-full bg-gold-500 px-7 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-gold-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
          >
            {t.button}
          </button>
        </form>
      </StatusCard>
    );
  }
  return <ResultMessage status={state} />;
}
