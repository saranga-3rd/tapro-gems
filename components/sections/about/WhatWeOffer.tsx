import Reveal from "@/components/motion/Reveal";
import RevealGroup from "@/components/motion/RevealGroup";
import Section from "@/components/ui/Section";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function WhatWeOffer() {
  const t = (await getDictionary()).about.offer;
  return (
    <Section background="white">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
        <Reveal className="flex flex-col items-center gap-6">
          <span className="text-sm font-medium tracking-[0.2em] text-gold-600 uppercase">
            {t.eyebrow}
          </span>
          <h2 className="font-display text-3xl leading-tight text-ink sm:text-4xl">
            {t.heading}
          </h2>
          <p className="text-base leading-relaxed text-ink-muted sm:text-lg">
            {t.intro}
          </p>
        </Reveal>

        <RevealGroup as="ul" className="flex flex-wrap justify-center gap-3" stagger={0.06}>
          {t.clientTypes.map((type) => (
            <li
              key={type}
              className="rounded-full border border-navy-900/15 px-4 py-2 text-sm text-ink"
            >
              {type}
            </li>
          ))}
        </RevealGroup>

        <Reveal delay={0.1}>
          <p className="text-base leading-relaxed text-ink-muted sm:text-lg">
            {t.outro}
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
