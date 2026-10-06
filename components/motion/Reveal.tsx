"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

interface RevealProps {
  children: ReactNode;
  className?: string;
  y?: number;
  delay?: number;
  duration?: number;
}

/**
 * Fades and lifts its content into place the first time it scrolls into
 * view. Renders fully visible without JS, so nothing depends on the
 * animation for the content to be readable.
 */
export default function Reveal({
  children,
  className = "",
  y = 28,
  delay = 0,
  duration = 1.1,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        },
      );
    });

    return () => ctx.revert();
  }, [y, delay, duration]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
