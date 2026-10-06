"use client";

import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";
import gsap from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

interface ImageRevealProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Wraps an image/visual block with a slow curtain-style clip-path reveal on
 * scroll-in. Drop-in replacement for the element's own wrapper div — pass
 * the same className that box previously had.
 */
export default function ImageReveal({ children, className = "", style }: ImageRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { clipPath: "inset(100% 0% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.3,
          ease: "power4.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        },
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
