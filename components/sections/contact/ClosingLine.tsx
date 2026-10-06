import Reveal from "@/components/motion/Reveal";
import Section from "@/components/ui/Section";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function ClosingLine() {
  const t = (await getDictionary()).contact.closing;
  return (
    <Section background="white">
      <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
        <p className="font-display text-2xl leading-snug text-ink sm:text-3xl">
          {t.headline}
        </p>
        <p className="text-base leading-relaxed text-ink-muted sm:text-lg">
          {t.text}
        </p>
      </Reveal>
    </Section>
  );
}
