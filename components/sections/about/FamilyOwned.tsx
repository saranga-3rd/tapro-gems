import Image from "next/image";
import ImageReveal from "@/components/motion/ImageReveal";
import Reveal from "@/components/motion/Reveal";
import Section from "@/components/ui/Section";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function FamilyOwned() {
  const t = (await getDictionary()).about.family;
  return (
    <Section background="ivory">
      <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-12">
        <Reveal className="flex flex-col gap-6">
          <span className="h-2 w-2 rounded-full bg-gold-500" aria-hidden="true" />
          <h2 className="font-display text-3xl leading-tight text-ink sm:text-4xl">
            {t.heading}
          </h2>
          <div className="flex flex-col gap-4 text-base leading-relaxed text-ink-muted sm:text-lg">
            {t.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.15} className="relative mx-auto w-full max-w-sm lg:max-w-none">
          <span
            aria-hidden="true"
            className="absolute -top-6 -right-6 -z-10 h-4/5 w-3/5 rounded-2xl bg-sapphire-100"
          />
          <ImageReveal className="relative aspect-4/5 w-full overflow-hidden rounded-2xl shadow-xl shadow-navy-900/10">
            <Image
              src="/Family-Owned-img.png"
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
