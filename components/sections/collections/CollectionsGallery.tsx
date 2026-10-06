import Image from "next/image";
import ImageReveal from "@/components/motion/ImageReveal";
import Reveal from "@/components/motion/Reveal";
import RevealGroup from "@/components/motion/RevealGroup";
import AutoplayVideo from "@/components/ui/AutoplayVideo";
import Section from "@/components/ui/Section";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getMedia } from "@/lib/store";

/** Items managed from the admin dashboard (Collections hub). */
export default async function CollectionsGallery() {
  const items = await getMedia("collections");
  const t = (await getDictionary()).collections.gallery;

  return (
    <Section background="white">
      <Reveal className="mb-16 flex flex-col items-center gap-4 text-center">
        <h2 className="font-display text-3xl font-semibold tracking-[0.2em] text-ink uppercase sm:text-4xl">
          {t.heading}
        </h2>
        <span className="h-px w-12 bg-gold-500" />
      </Reveal>

      <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ImageReveal
            key={item.id}
            className="relative aspect-3/4 w-full overflow-hidden rounded-2xl shadow-sm shadow-navy-900/10"
          >
            {item.type === "video" ? (
              <AutoplayVideo
                src={item.src}
                poster=""
                aria-label={item.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <Image
                src={item.src}
                alt={item.title}
                fill
                sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            )}
          </ImageReveal>
        ))}
      </RevealGroup>
    </Section>
  );
}
