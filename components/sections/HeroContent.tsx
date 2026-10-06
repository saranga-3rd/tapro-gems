import Button from "@/components/ui/Button";
import type { Dictionary } from "@/messages/en";

interface HeroContentProps {
  content: Dictionary["home"]["hero"];
}

/**
 * Left-column hero copy. Each `data-hero` attribute is a GSAP target
 * selector scoped by HeroSection's intro/scroll timelines — no refs
 * threaded through props needed.
 */
export default function HeroContent({ content: t }: HeroContentProps) {
  return (
    <div data-hero="text-column" className="relative flex flex-col gap-8">
      <h1 className="max-w-xl font-display text-4xl leading-[1.1] [text-shadow:0_4px_20px_rgba(7,13,25,0.85)] sm:text-5xl lg:text-6xl xl:text-7xl">
        <span data-hero="heading-1" className="block">
          {t.heading1}
        </span>
        <span data-hero="heading-2" className="block">
          {t.heading2}
        </span>
      </h1>
      <p
        data-hero="paragraph"
        className="max-w-lg text-base leading-relaxed text-ivory-200/80 [text-shadow:0_2px_12px_rgba(7,13,25,0.85)] sm:text-lg"
      >
        {t.paragraph}
      </p>
      <div data-hero="buttons" className="mt-4 flex flex-col gap-4 sm:flex-row">
        <Button href="/shop" size="md">
          {t.explore}
        </Button>
        <Button href="/appointment" variant="outline" tone="dark" size="md">
          {t.book}
        </Button>
      </div>
    </div>
  );
}
