import GemstoneCard from "@/components/gemstone/GemstoneCard";
import Reveal from "@/components/motion/Reveal";
import RevealGroup from "@/components/motion/RevealGroup";
import Button from "@/components/ui/Button";
import Section from "@/components/ui/Section";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getFeaturedGemstones } from "@/lib/store";

export default async function FeaturedGemstones() {
  const featuredGemstones = await getFeaturedGemstones();
  const t = (await getDictionary()).home.featured;
  return (
    <Section background="white">
      <Reveal className="mb-16 flex flex-col items-center gap-4 text-center">
        <h2 className="font-display text-3xl font-semibold tracking-[0.2em] text-ink uppercase sm:text-4xl">
          {t.title}
        </h2>
        <span className="h-px w-12 bg-gold-500" />
      </Reveal>

      <RevealGroup className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
        {featuredGemstones.map((gemstone) => (
          <GemstoneCard key={gemstone.id} gemstone={gemstone} autoplayVideo />
        ))}
      </RevealGroup>

      <Reveal className="mt-16 flex justify-center">
        <Button href="/shop" variant="outline" size="sm">
          {t.viewAll}
        </Button>
      </Reveal>
    </Section>
  );
}
