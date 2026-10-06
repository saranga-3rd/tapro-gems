"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import Reveal from "@/components/motion/Reveal";
import ColumnLines from "@/components/ui/ColumnLines";
import gsap from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

export default function ShortIntro({
  watermarkNatural,
  watermarkTrusted,
  text,
}: {
  watermarkNatural: string;
  watermarkTrusted: string;
  text: string;
}) {
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
          '[data-watermark="natural"]',
          { xPercent: -20 },
          { xPercent: 20, ease: "none" },
          0,
        )
        .fromTo(
          '[data-watermark="trusted"]',
          { xPercent: 20 },
          { xPercent: -20, ease: "none" },
          0,
        );
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-ivory py-20 md:py-28">
      <ColumnLines tone="light" />
      <span
        data-watermark="natural"
        aria-hidden="true"
        className="pointer-events-none absolute top-2 left-0 block select-none font-display text-[9rem] leading-none whitespace-nowrap text-navy-900/5 sm:text-[13rem] lg:text-[17rem]"
      >
        {watermarkNatural}
      </span>
      <span
        data-watermark="trusted"
        aria-hidden="true"
        className="pointer-events-none absolute right-0 bottom-2 block select-none font-display text-[9rem] leading-none whitespace-nowrap text-navy-900/5 sm:text-[13rem] lg:text-[17rem]"
      >
        {watermarkTrusted}
      </span>

      <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-12 px-6 text-center">
        <Reveal>
          <p className="font-display text-2xl leading-relaxed text-ink sm:text-3xl lg:text-4xl">
            {text}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
