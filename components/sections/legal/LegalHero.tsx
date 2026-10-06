import Container from "@/components/ui/Container";
import Reveal from "@/components/motion/Reveal";

interface LegalHeroProps {
  eyebrow: string;
  title: string;
  /** Already-localised "Last updated: …" line. */
  lastUpdated: string;
  /** Shown only when non-empty (fi/sv: the document is English-only). */
  notice?: string;
  intro: string[];
}

export default function LegalHero({ eyebrow, title, lastUpdated, notice, intro }: LegalHeroProps) {
  return (
    <section className="relative overflow-hidden bg-ivory pt-36 pb-16 text-ink sm:pt-40">
      <Container>
        <Reveal className="flex max-w-2xl flex-col gap-6">
          <span className="text-sm font-medium tracking-[0.3em] text-gold-600 uppercase">
            {eyebrow}
          </span>
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">{title}</h1>
          <p className="text-sm text-ink-muted">{lastUpdated}</p>
          {notice ? (
            <p
              role="note"
              className="rounded-2xl border border-gold-500/40 bg-white px-4 py-3 text-sm text-ink-muted"
            >
              {notice}
            </p>
          ) : null}
          {intro.map((paragraph) => (
            <p key={paragraph} className="text-base leading-relaxed text-ink-muted sm:text-lg">
              {paragraph}
            </p>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
