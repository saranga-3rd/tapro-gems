import Reveal from "@/components/motion/Reveal";
import Section from "@/components/ui/Section";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function ShortIntro() {
  const t = (await getDictionary()).contact.shortIntro;
  return (
    <Section background="white">
      <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <span className="h-px w-16 bg-gold-500" />
        <p className="text-lg leading-relaxed text-ink-muted sm:text-xl">
          {t.text}
        </p>
      </Reveal>
    </Section>
  );
}
