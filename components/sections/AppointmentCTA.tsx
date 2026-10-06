import Image from "next/image";
import { getDictionary } from "@/lib/i18n/dictionary";
import Reveal from "@/components/motion/Reveal";
import Button from "@/components/ui/Button";
import ColumnLines from "@/components/ui/ColumnLines";
import Container from "@/components/ui/Container";

export default async function AppointmentCTA() {
  const t = (await getDictionary()).home.appointment;
  return (
    <section className="relative overflow-hidden bg-ivory">
      <div className="relative bg-ivory">
        <ColumnLines tone="light" />
        <Container className="relative flex flex-col items-center gap-5 pt-24 pb-10 text-center md:pt-32 lg:pt-40">
          <Reveal className="flex flex-col items-center gap-5">
            <span className="h-px w-16 bg-gold-500" />
            <h2 className="max-w-2xl font-display text-3xl leading-tight text-ink sm:text-4xl lg:text-5xl">
              {t.title}
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <Button href="/appointment" size="md">
              {t.cta}
            </Button>
          </Reveal>
        </Container>
      </div>

      <div className="relative mx-auto w-full max-w-[1920px]">
        <div className="relative aspect-1983/793 w-full bg-ivory">
          <Image
            src="/footer-img.png"
            alt={t.imageAlt}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
