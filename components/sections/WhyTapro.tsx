import { Check } from "lucide-react";
import Image from "next/image";
import ImageReveal from "@/components/motion/ImageReveal";
import Reveal from "@/components/motion/Reveal";
import RevealGroup from "@/components/motion/RevealGroup";
import Button from "@/components/ui/Button";
import Section from "@/components/ui/Section";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function WhyTapro() {
  const t = (await getDictionary()).home.why;
  return (
    <Section background="ivory">
      <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-12">
        <Reveal className="relative mx-auto w-full max-w-sm lg:max-w-none">
          <span
            aria-hidden="true"
            className="absolute -top-6 -left-6 -z-10 h-4/5 w-3/5 rounded-2xl bg-gold-100"
          />
          <span
            aria-hidden="true"
            className="absolute -right-6 -bottom-6 -z-10 h-4/5 w-3/5 rounded-2xl bg-sapphire-100"
          />
          <ImageReveal className="relative aspect-4/5 w-full overflow-hidden rounded-2xl">
            <Image
              src="/gem-w-girl.png"
              alt={t.imageAlt}
              fill
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="object-cover"
            />
          </ImageReveal>
        </Reveal>

        <Reveal delay={0.15} className="flex flex-col gap-6">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-gold-500" />
          <h2 className="font-display text-4xl leading-tight text-ink sm:text-5xl">
            {t.titleLines[0]}
            <br />
            {t.titleLines[1]}
          </h2>
          <p className="max-w-md text-base leading-relaxed text-ink-muted sm:text-lg">
            {t.text}
          </p>

          <RevealGroup
            as="ul"
            className="flex flex-wrap gap-x-6 gap-y-3"
            stagger={0.06}
          >
            {t.keyPoints.map((point) => (
              <li key={point} className="flex items-center gap-2 text-sm font-medium text-ink">
                <Check className="h-4 w-4 text-gold-600" aria-hidden="true" />
                {point}
              </li>
            ))}
          </RevealGroup>

          <Button href="/about#certification" variant="outline" size="sm" className="w-fit gap-3">
            <span aria-hidden="true" className="h-px w-6 bg-current" />
            {t.cta}
          </Button>
        </Reveal>
      </div>
    </Section>
  );
}
