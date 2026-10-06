"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

interface ParallaxProps {
  children: ReactNode;
  className?: string;
  amount?: number;
}

/**
 * Slow vertical drift tied to scroll progress through the parent section —
 * for background glows/imagery only. Distance is scaled down on mobile,
 * where large parallax offsets tend to read as janky rather than cinematic.
 */
export default function Parallax({ children, className = "", amount = 60 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const mm = gsap.matchMedia();

    mm.add(
      { isMobile: "(max-width: 767px)" },
      (context) => {
        const { isMobile } = context.conditions as { isMobile: boolean };
        const distance = isMobile ? amount * 0.4 : amount;

        gsap.fromTo(
          el,
          { y: -distance },
          {
            y: distance,
            ease: "none",
            scrollTrigger: {
              trigger: el.parentElement ?? el,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      },
    );

    return () => mm.revert();
  }, [amount]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
