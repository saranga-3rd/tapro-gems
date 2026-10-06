import GemstoneCard from "@/components/gemstone/GemstoneCard";
import Reveal from "@/components/motion/Reveal";
import RevealGroup from "@/components/motion/RevealGroup";
import Section from "@/components/ui/Section";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getGemstones } from "@/lib/catalog";

export default async function ShopGrid() {
  const gemstones = await getGemstones();
  const t = (await getDictionary()).shop.grid;
  return (
    <Section background="white">
      <Reveal className="mb-16 flex flex-col items-center gap-4 text-center">
        <h2 className="font-display text-3xl font-semibold tracking-[0.2em] text-ink uppercase sm:text-4xl">
          {t.heading}
        </h2>
        <span className="h-px w-12 bg-gold-500" />
      </Reveal>

      <RevealGroup className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
        {gemstones.map((gemstone) => (
          <GemstoneCard key={gemstone.id} gemstone={gemstone} />
        ))}
      </RevealGroup>
    </Section>
  );
}
