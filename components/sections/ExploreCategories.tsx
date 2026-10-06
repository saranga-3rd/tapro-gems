import Reveal from "@/components/motion/Reveal";
import RevealGroup from "@/components/motion/RevealGroup";
import CategoryCard from "@/components/ui/CategoryCard";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { gemstoneCategories } from "@/lib/data/gemstones";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getGemstones } from "@/lib/store";

export default async function ExploreCategories() {
  const gemstones = await getGemstones();
  const t = (await getDictionary()).home.categories;
  return (
    <Section background="ivory">
      <Reveal className="mb-14">
        <SectionHeading eyebrow={t.eyebrow} title={t.title} align="center" />
      </Reveal>
      <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {gemstoneCategories.map((category) => {
          const gemstone = gemstones.find((g) => g.slug === category.gemstoneSlug);
          return (
            <CategoryCard
              key={category.slug}
              name={t.names[category.slug as keyof typeof t.names] ?? category.name}
              image={category.image}
              href={gemstone ? `/shop/${gemstone.slug}` : "/shop"}
            />
          );
        })}
      </RevealGroup>
    </Section>
  );
}
