import ImageReveal from "@/components/motion/ImageReveal";
import Reveal from "@/components/motion/Reveal";
import GemPlaceholder from "@/components/ui/GemPlaceholder";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function FounderStory() {
  const t = (await getDictionary()).home.founder;
  return (
    <Section background="ivory">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <ImageReveal className="aspect-4/5 w-full overflow-hidden rounded-2xl">
          <GemPlaceholder tone="gold" className="h-full w-full" />
        </ImageReveal>
        <Reveal delay={0.15}>
          <SectionHeading
            eyebrow={t.eyebrow}
            title={t.title}
            description={t.description}
          />
        </Reveal>
      </div>
    </Section>
  );
}
