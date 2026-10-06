"use client";

import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { useRef } from "react";
import Container from "@/components/ui/Container";
import gsap from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

export default function CollectionsHero({
  imageAlt,
  eyebrow,
  heading,
  text,
}: {
  imageAlt: string;
  eyebrow: string;
  heading: string;
  text: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from('[data-hero="background"]', { opacity: 0, duration: 1.1 })
        .from('[data-hero="eyebrow"]', { opacity: 0, y: 16, duration: 0.8 }, "-=0.6")
        .from('[data-hero="heading"]', { opacity: 0, y: 26, duration: 0.9 }, "-=0.55")
        .from('[data-hero="paragraph"]', { opacity: 0, y: 16, duration: 0.8 }, "-=0.5");
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen items-center overflow-hidden bg-ivory text-ink"
    >
      <div data-hero="background" className="absolute inset-0">
        <Image
          src="/collection_hero.png"
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(250,248,244,0.92)_0%,rgba(250,248,244,0.6)_28%,rgba(250,248,244,0)_55%)]" />
      </div>

      <Container className="relative pt-32 pb-20">
        <div className="flex max-w-xl flex-col gap-6">
          <span
            data-hero="eyebrow"
            className="text-sm font-medium tracking-[0.3em] text-gold-600 uppercase"
          >
            {eyebrow}
          </span>
          <h1
            data-hero="heading"
            className="font-display text-4xl leading-tight sm:text-5xl lg:text-6xl"
          >
            {heading}
          </h1>
          <p
            data-hero="paragraph"
            className="max-w-lg text-base leading-relaxed text-ink-muted sm:text-lg"
          >
            {text}
          </p>
        </div>
      </Container>
    </section>
  );
}
