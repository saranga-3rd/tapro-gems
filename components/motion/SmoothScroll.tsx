"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";
import gsap, { ScrollTrigger } from "@/lib/gsap";

/**
 * Syncs Lenis's smooth-scroll rAF loop with GSAP's ticker so ScrollTrigger
 * stays in lock-step with the smoothed scroll position. Lenis keeps native
 * page scrolling (scrollbar, anchor links, position: fixed) intact and
 * honours prefers-reduced-motion itself (locks lerp to 1, i.e. native feel).
 */
export default function SmoothScroll() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  const previousPath = useRef(pathname);

  // Route changes without a #hash always start at the top of the new page.
  useLayoutEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    if (window.location.hash) return;
    lenisRef.current?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
  }, [pathname]);

  useLayoutEffect(() => {
    const lenis = new Lenis({ duration: 1.1, anchors: true });
    lenisRef.current = lenis;

    const syncScrollTrigger = () => ScrollTrigger.update();
    const raf = (time: number) => lenis.raf(time * 1000);

    lenis.on("scroll", syncScrollTrigger);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.off("scroll", syncScrollTrigger);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return null;
}
