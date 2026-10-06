import Image from "next/image";
import ImageReveal from "@/components/motion/ImageReveal";
import Reveal from "@/components/motion/Reveal";
import Button from "@/components/ui/Button";
import Section from "@/components/ui/Section";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function EveryOccasion() {
  const t = (await getDictionary()).home.occasion;
  return (
    <Section background="white">
      <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-12">
        <Reveal className="order-last flex flex-col gap-6 lg:order-0">
          <h2 className="font-display text-4xl leading-tight text-ink sm:text-5xl">
            {t.titleLines[0]}
            <br />
            {t.titleLines[1]}
          </h2>
          <p className="max-w-md text-base leading-relaxed text-ink-muted sm:text-lg">
            {t.text}
          </p>
          <Button href="/shop" variant="outline" size="sm" className="w-fit gap-3">
            <span aria-hidden="true" className="h-px w-6 bg-current" />
            {t.cta}
          </Button>
        </Reveal>

        <Reveal
          delay={0.15}
          className="relative order-first mx-auto w-full max-w-sm lg:order-0 lg:max-w-none"
        >
          <span
            aria-hidden="true"
            className="absolute -right-6 -bottom-6 -z-10 h-4/5 w-3/5 rounded-2xl bg-sapphire-100"
          />
          <span
            aria-hidden="true"
            className="absolute -top-3 -left-3 h-2 w-2 rounded-full bg-gold-500"
          />
          <ImageReveal className="relative aspect-4/5 w-full overflow-hidden rounded-2xl">
            <Image
              src="/girl-gem-side-view.png"
              alt={t.imageAlt}
              fill
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="object-cover"
            />
          </ImageReveal>
        </Reveal>
      </div>
    </Section>
  );
}
