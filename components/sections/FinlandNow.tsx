import Reveal from "@/components/motion/Reveal";
import Button from "@/components/ui/Button";
import Section from "@/components/ui/Section";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function FinlandNow() {
  const t = (await getDictionary()).home.finland;
  return (
    <Section background="navy-deep" className="lg:py-32">
      <Reveal className="flex flex-col items-center gap-8 text-center">
        <div className="flex items-center gap-4 text-gold-300">
          <span aria-hidden="true" className="h-px w-10 bg-gold-400/60" />
          <span className="text-sm font-medium uppercase tracking-[0.3em]">{t.eyebrow}</span>
          <span aria-hidden="true" className="h-px w-10 bg-gold-400/60" />
        </div>

        <h2 className="font-display text-6xl leading-none text-ivory sm:text-7xl lg:text-9xl">
          {t.title}
        </h2>

        <span aria-hidden="true" className="h-2 w-2 rotate-45 bg-gold-500" />

        <Button href="/appointment" size="md">
          {t.cta}
        </Button>
      </Reveal>
    </Section>
  );
}
