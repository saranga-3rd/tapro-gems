import type { Metadata } from "next";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { getDictionary } from "@/lib/i18n/dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const { notFound } = await getDictionary();
  return { title: notFound.meta.title };
}

export default async function NotFound() {
  const t = (await getDictionary()).notFound;
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-navy-950 text-ivory">
      <Image
        src="/gems-back-img.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-50"
      />
      <div className="absolute inset-0 bg-linear-to-t from-navy-950 via-navy-950/60 to-navy-950/30" />

      <Container className="relative flex flex-col items-center gap-6 pt-32 pb-20 text-center">
        <div className="relative h-40 w-40 sm:h-52 sm:w-52">
          <Image
            src="/blue-gem.png"
            alt={t.imageAlt}
            fill
            sizes="208px"
            className="object-contain drop-shadow-[0_0_40px_rgba(79,125,203,0.5)]"
          />
        </div>
        <span className="font-display text-7xl leading-none text-gold-400 sm:text-8xl">404</span>
        <h1 className="font-display text-3xl leading-tight sm:text-4xl">
          {t.heading}
        </h1>
        <p className="max-w-md text-base leading-relaxed text-ivory-200/80 sm:text-lg">
          {t.body}
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button href="/" size="md">
            {t.backHome}
          </Button>
          <Button href="/shop" variant="outline" tone="dark" size="md">
            {t.browse}
          </Button>
        </div>
      </Container>
    </section>
  );
}
