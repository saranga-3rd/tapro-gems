"use client";

import { useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";
import gsap from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

type RevealGroupTag = "div" | "dl" | "ul";

interface RevealGroupProps {
  children: ReactNode;
  className?: string;
  as?: RevealGroupTag;
  y?: number;
  stagger?: number;
  duration?: number;
}

/**
 * Reveals its direct children with a subtle staggered fade + lift, for
 * grids of cards or trust points. Same fully-visible-without-JS guarantee
 * as `Reveal`.
 */
export default function RevealGroup({
  children,
  className = "",
  as = "div",
  y = 28,
  stagger = 0.12,
  duration = 0.9,
}: RevealGroupProps) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const targets = Array.from(el.children);
    if (targets.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          stagger,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        },
      );
    });

    return () => ctx.revert();
  }, [y, stagger, duration]);

  if (as === "dl") {
    return (
      <dl ref={ref as RefObject<HTMLDListElement | null>} className={className}>
        {children}
      </dl>
    );
  }

  if (as === "ul") {
    return (
      <ul ref={ref as RefObject<HTMLUListElement | null>} className={className}>
        {children}
      </ul>
    );
  }

  return (
    <div ref={ref as RefObject<HTMLDivElement | null>} className={className}>
      {children}
    </div>
  );
}
