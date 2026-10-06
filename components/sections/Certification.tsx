import { Award, ShieldCheck } from "lucide-react";
import { getDictionary } from "@/lib/i18n/dictionary";
import Button from "@/components/ui/Button";
import Reveal from "@/components/motion/Reveal";
import RevealGroup from "@/components/motion/RevealGroup";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";

const certificateIcons = [ShieldCheck, Award];

export default async function Certification() {
  const t = (await getDictionary()).home.certification;
  return (
    <Section background="white">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
        <Reveal className="flex flex-col items-center gap-6">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-gold-500" />
          <SectionHeading
            align="center"
            eyebrow={t.eyebrow}
            title={t.title}
            description={t.description}
          />
        </Reveal>

        <RevealGroup
          className="flex w-full flex-col gap-6 border-t border-navy-900/10 pt-8"
          stagger={0.1}
        >
          {t.certificates.map(({ title, description }, i) => {
            const Icon = certificateIcons[i];
            return (
            <div key={title} className="flex flex-col items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sapphire-900/5 text-sapphire-700">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display text-lg text-ink">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                  {description}
                </p>
              </div>
            </div>
            );
          })}
        </RevealGroup>

        <Button href="/about#certification" variant="outline" size="sm" className="w-fit gap-3">
          <span aria-hidden="true" className="h-px w-6 bg-current" />
          {t.cta}
        </Button>
      </div>
    </Section>
  );
}
