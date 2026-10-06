import Image from "next/image";
import Link from "@/components/i18n/LocaleLink";
import ImageReveal from "@/components/motion/ImageReveal";
import Reveal from "@/components/motion/Reveal";
import ColumnLines from "@/components/ui/ColumnLines";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function CollectionsBanner() {
  const t = (await getDictionary()).home.banner;
  return (
    <Link
      href="/shop"
      aria-label={t.ariaLabel}
      className="group relative flex h-135 flex-col items-center justify-center overflow-hidden bg-ivory sm:h-160 lg:h-185"
    >
      <ColumnLines tone="light" />

      <Reveal className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span
          aria-hidden="true"
          className="select-none font-display text-[5.5rem] leading-none tracking-tight text-gold-500/60 sm:text-[8.5rem] lg:text-[15rem]"
        >
          {t.watermark}
        </span>
      </Reveal>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-[18%] right-[28%] h-2 w-2 rounded-full bg-gold-500/70 sm:right-[32%]"
      />

      <ImageReveal className="pointer-events-none absolute top-0 left-1/2 h-full w-64 -translate-x-1/2 sm:w-80 lg:w-96">
        <Image
          src="/hand-with-gem.png"
          alt={t.imageAlt}
          fill
          sizes="(min-width: 1024px) 24rem, (min-width: 640px) 20rem, 16rem"
          className="object-contain object-top transition-transform duration-500 group-hover:scale-105"
        />
      </ImageReveal>

      <Reveal
        delay={0.15}
        className="pointer-events-none absolute inset-x-0 bottom-6 px-6 text-center sm:bottom-8 lg:bottom-10"
      >
        <p className="font-display mx-auto max-w-2xl text-xl leading-snug text-ink sm:text-2xl lg:text-3xl">
          {t.text}
        </p>
      </Reveal>
    </Link>
  );
}
