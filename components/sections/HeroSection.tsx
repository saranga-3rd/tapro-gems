"use client";

import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { useRef } from "react";
import Container from "@/components/ui/Container";
import gsap from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import type { Dictionary } from "@/messages/en";
import HeroContent from "./HeroContent";

interface HeroSectionProps {
  content: Dictionary["home"]["hero"];
}

/**
 * Simple hero: full-bleed portrait photography behind a gradient for
 * legibility, with a short intro fade-in and a subtle scroll-out fade.
 * Never pins the section — scrolling stays entirely native.
 */
export default function HeroSection({ content }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from('[data-hero="background"]', { opacity: 0, duration: 1.1 })
        .from('[data-hero="heading-1"]', { opacity: 0, y: 26, duration: 0.9 }, "-=0.6")
        .from('[data-hero="heading-2"]', { opacity: 0, y: 26, duration: 0.9 }, "-=0.6")
        .from('[data-hero="paragraph"]', { opacity: 0, y: 16, duration: 0.8 }, "-=0.55")
        .from(
          '[data-hero="buttons"] > *',
          { opacity: 0, y: 16, duration: 0.7, stagger: 0.12 },
          "-=0.4",
        );

      gsap.to('[data-hero="text-column"]', {
        y: -60,
        opacity: 0.15,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen items-center overflow-hidden bg-navy-950 text-ivory"
    >
      <div data-hero="background" className="absolute inset-0">
        <Image
          src="/hero-img.png"
          alt={content.imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(7,13,25,0.88)_0%,rgba(7,13,25,0.55)_22%,rgba(7,13,25,0)_50%)]" />
      </div>

      <Container className="relative pt-32 pb-20">
        <HeroContent content={content} />
      </Container>
    </section>
  );
}
