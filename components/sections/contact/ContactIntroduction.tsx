import Reveal from "@/components/motion/Reveal";
import Section from "@/components/ui/Section";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function ContactIntroduction() {
  const t = (await getDictionary()).contact.introduction;
  return (
    <Section background="ivory">
      <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
        <span className="h-2 w-2 rounded-full bg-gold-500" aria-hidden="true" />
        <h2 className="font-display text-3xl leading-tight text-ink sm:text-4xl">
          {t.heading}
        </h2>
        <div className="flex flex-col gap-4 text-base leading-relaxed text-ink-muted sm:text-lg">
          {t.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}
