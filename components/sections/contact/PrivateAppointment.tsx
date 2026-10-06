import Image from "next/image";
import Reveal from "@/components/motion/Reveal";
import Button from "@/components/ui/Button";
import ColumnLines from "@/components/ui/ColumnLines";
import Container from "@/components/ui/Container";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function PrivateAppointment() {
  const t = (await getDictionary()).contact.privateAppointment;
  return (
    <section className="relative overflow-hidden bg-navy-950 text-ivory">
      <Image
        src="/gems-back-img.png"
        alt={t.imageAlt}
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-navy-950/30" />
      <ColumnLines tone="dark" />

      <Container className="relative flex flex-col items-center gap-6 py-24 text-center md:py-32 lg:py-40">
        <Reveal className="flex flex-col items-center gap-6">
          <span className="h-px w-16 bg-gold-400" aria-hidden="true" />
          <h2 className="font-display text-3xl leading-tight sm:text-4xl">
            {t.heading}
          </h2>
          <p className="max-w-lg text-base leading-relaxed text-ivory-200/80 sm:text-lg">
            {t.text}
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <Button href="/appointment" size="md">
            {t.cta}
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}
