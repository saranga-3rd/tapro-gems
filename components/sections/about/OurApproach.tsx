import { Check } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import RevealGroup from "@/components/motion/RevealGroup";
import Section from "@/components/ui/Section";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function OurApproach() {
  const t = (await getDictionary()).about.approach;
  return (
    <Section background="white">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-10 text-center">
        <Reveal className="flex flex-col items-center gap-4">
          <span className="text-sm font-medium tracking-[0.2em] text-gold-600 uppercase">
            {t.eyebrow}
          </span>
          <h2 className="font-display text-3xl leading-tight text-ink sm:text-4xl">
            {t.heading}
          </h2>
        </Reveal>

        <RevealGroup
          as="ul"
          className="flex flex-wrap justify-center gap-x-6 gap-y-4"
          stagger={0.06}
        >
          {t.points.map((point) => (
            <li key={point} className="flex items-center gap-2 text-sm font-medium text-ink">
              <Check className="h-4 w-4 text-gold-600" aria-hidden="true" />
              {point}
            </li>
          ))}
        </RevealGroup>
      </div>
    </Section>
  );
}
