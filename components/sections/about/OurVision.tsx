import Reveal from "@/components/motion/Reveal";
import Section from "@/components/ui/Section";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function OurVision() {
  const t = (await getDictionary()).about.vision;
  return (
    <Section background="ivory">
      <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
        <span className="text-sm font-medium tracking-[0.3em] text-gold-600 uppercase">
          {t.eyebrow}
        </span>
        <span className="h-px w-16 bg-gold-500" aria-hidden="true" />
        <p className="font-accent text-2xl leading-relaxed text-ink-muted italic sm:text-3xl lg:text-4xl">
          {t.quote}
        </p>
      </Reveal>
    </Section>
  );
}
