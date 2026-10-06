import Reveal from "@/components/motion/Reveal";
import Section from "@/components/ui/Section";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function OurStory() {
  const t = (await getDictionary()).about.story;
  return (
    <Section background="ivory">
      <div className="mx-auto max-w-3xl">
        <Reveal className="flex flex-col gap-6">
          <span className="h-2 w-2 rounded-full bg-gold-500" aria-hidden="true" />
          <h2 className="font-display text-3xl leading-tight text-ink sm:text-4xl">{t.heading}</h2>
          <div className="flex flex-col gap-4 text-base leading-relaxed text-ink-muted sm:text-lg">
            {t.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
