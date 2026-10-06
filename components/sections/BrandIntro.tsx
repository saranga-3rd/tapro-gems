"use client";

import { useGSAP } from "@gsap/react";
import Link from "@/components/i18n/LocaleLink";
import { useRef } from "react";
import Reveal from "@/components/motion/Reveal";
import ColumnLines from "@/components/ui/ColumnLines";
import gsap from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import type { Dictionary } from "@/messages/en";

interface BrandIntroProps {
  content: Dictionary["home"]["brandIntro"];
}

export default function BrandIntro({ content: t }: BrandIntroProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap
        .timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        })
        .fromTo(
          '[data-watermark="gemstones"]',
          { xPercent: -20 },
          { xPercent: 20, ease: "none" },
          0,
        )
        .fromTo(
          '[data-watermark="selection"]',
          { xPercent: 20 },
          { xPercent: -20, ease: "none" },
          0,
        );
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-ivory py-20 md:py-28"
    >
      <ColumnLines tone="light" />
      <span
        data-watermark="gemstones"
        aria-hidden="true"
        className="pointer-events-none absolute top-2 left-0 block select-none font-display text-[9rem] leading-none whitespace-nowrap text-navy-900/5 sm:text-[13rem] lg:text-[17rem]"
      >
        {t.watermarkTop}
      </span>
      <span
        data-watermark="selection"
        aria-hidden="true"
        className="pointer-events-none absolute right-0 bottom-2 block select-none font-display text-[9rem] leading-none whitespace-nowrap text-navy-900/5 sm:text-[13rem] lg:text-[17rem]"
      >
        {t.watermarkBottom}
      </span>

      <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-12 px-6 text-center">
        <Reveal>
          <p className="font-display text-2xl leading-relaxed text-ink sm:text-3xl lg:text-4xl">
            {t.text}
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <Link
            href="/about"
            className="flex h-32 w-32 flex-col items-center justify-center gap-0.5 rounded-full border border-navy-900/20 text-xs font-semibold tracking-[0.15em] text-navy-900 uppercase transition-colors hover:border-gold-500 hover:text-gold-600"
          >
            <span>{t.storyLine1}</span>
            <span>{t.storyLine2}</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
