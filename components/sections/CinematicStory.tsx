import Image from "next/image";
import Link from "@/components/i18n/LocaleLink";
import ImageReveal from "@/components/motion/ImageReveal";
import Reveal from "@/components/motion/Reveal";
import ColumnLines from "@/components/ui/ColumnLines";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function CinematicStory() {
  const t = (await getDictionary()).home.story;
  return (
    <section className="relative overflow-hidden bg-ivory py-24 md:py-32 lg:py-40">
      <ColumnLines tone="light" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 sm:px-8 lg:grid-cols-2 lg:gap-12 lg:px-12">
        <Reveal className="flex flex-col gap-6 text-center lg:text-left">
          <h2 className="font-display text-5xl text-ink sm:text-6xl">{t.title}</h2>
          <p className="mx-auto max-w-md text-base leading-relaxed text-ink-muted sm:text-lg lg:mx-0">
            {t.quote}
          </p>

          <div className="mt-6 flex justify-center lg:justify-start">
            <Link
              href="/about"
              className="flex h-28 w-28 flex-col items-center justify-center gap-0.5 rounded-full bg-white text-center text-[11px] font-semibold tracking-[0.15em] text-ink uppercase shadow-lg shadow-navy-900/10 transition-colors hover:bg-gold-400 hover:text-navy-950 sm:h-32 sm:w-32"
            >
              <span>{t.journeyLine1}</span>
              <span>{t.journeyLine2}</span>
            </Link>
          </div>
        </Reveal>

        <Reveal
          delay={0.15}
          className="relative mx-auto h-105 w-full max-w-md sm:h-120 lg:mx-0 lg:h-140 lg:max-w-none"
        >
          <ImageReveal className="absolute top-0 left-0 h-3/5 w-3/5 overflow-hidden rounded-2xl shadow-xl shadow-navy-900/20 sm:h-2/3 sm:w-2/3">
            <Image
              src="/real-gem.png"
              alt={t.imageAlt1}
              fill
              sizes="(min-width: 1024px) 20rem, 60vw"
              className="object-cover"
            />
          </ImageReveal>
          <span
            aria-hidden="true"
            className="absolute top-8 left-[56%] h-2 w-2 rounded-full bg-gold-500 sm:left-[62%]"
          />
          <ImageReveal className="absolute right-0 bottom-0 h-3/4 w-3/4 overflow-hidden rounded-2xl shadow-2xl shadow-navy-900/25 ring-8 ring-ivory">
            <Image
              src="/both-hand-with-gem.png"
              alt={t.imageAlt2}
              fill
              sizes="(min-width: 1024px) 24rem, 75vw"
              className="object-cover"
            />
          </ImageReveal>
        </Reveal>
      </div>
    </section>
  );
}
