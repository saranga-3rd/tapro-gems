import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "@/components/i18n/LocaleLink";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/gemstone/ProductGallery";
import Reveal from "@/components/motion/Reveal";
import Button from "@/components/ui/Button";
import Section from "@/components/ui/Section";
import { categoryLabel } from "@/lib/data/gemstones";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary, getDictionaryFor } from "@/lib/i18n/dictionary";
import { pageAlternates } from "@/lib/i18n/metadata";
import { getGemstoneBySlug, getGemstones } from "@/lib/catalog";

export async function generateStaticParams() {
  return (await getGemstones()).map((gemstone) => ({ id: gemstone.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/shop/[id]">): Promise<Metadata> {
  const { lang, id } = await params;
  if (!hasLocale(lang)) return {};
  const gemstone = await getGemstoneBySlug(id);

  if (!gemstone) {
    return { title: (await getDictionaryFor(lang)).shop.product.notFoundTitle };
  }

  return {
    title: `${gemstone.name} | Tapro Gems`,
    description: gemstone.description,
    alternates: pageAlternates(`/shop/${gemstone.slug}`, lang),
  };
}

export default async function GemstonePage({ params }: PageProps<"/[lang]/shop/[id]">) {
  const { id } = await params;
  const t = (await getDictionary()).shop;
  const gemstone = await getGemstoneBySlug(id);

  if (!gemstone) {
    notFound();
  }

  const specs = [
    { label: t.card.carat, value: `${gemstone.caratWeight.toFixed(2)} ct` },
    { label: t.card.cut, value: gemstone.cut },
    { label: t.card.colour, value: gemstone.colour },
    { label: t.card.origin, value: gemstone.origin },
  ];

  return (
    <Section background="ivory" className="pt-32 md:pt-40 lg:pt-48">
      <Link
        href="/shop"
        className="mb-10 inline-flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t.product.backToShop}
      </Link>

      <div className="grid gap-16 lg:grid-cols-2 lg:gap-12">
        <Reveal>
          <ProductGallery
            name={gemstone.name}
            image={gemstone.image}
            gallery={gemstone.gallery}
            videoSrc={gemstone.video}
            labels={{
              playVideo: t.product.galleryPlayVideo.replace("{name}", gemstone.name),
              showImage: t.product.galleryShowImage.replace("{name}", gemstone.name),
            }}
          />
        </Reveal>

        <Reveal delay={0.15} className="flex flex-col gap-6 lg:sticky lg:top-32 lg:self-start">
          <span className="inline-block w-fit border-b-2 border-gold-500 pb-1 text-xs font-medium tracking-[0.2em] text-ink uppercase">
            {categoryLabel(t.categories, gemstone.category)}
          </span>
          <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">
            {gemstone.name}
          </h1>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-b border-navy-900/10 py-6 text-sm">
            {specs.map(({ label, value }) => (
              <div key={label}>
                <dt className="text-[11px] text-ink-muted/60 uppercase">{label}</dt>
                <dd className="mt-1 text-base text-ink">{value}</dd>
              </div>
            ))}
            <div className="col-span-2">
              <dt className="text-[11px] text-ink-muted/60 uppercase">{t.product.certification}</dt>
              <dd className="mt-1 text-base text-ink">{gemstone.certification}</dd>
            </div>
          </dl>

          <p className="text-base leading-relaxed text-ink-muted sm:text-lg">
            {gemstone.description}
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Button href="/appointment" size="md">
              {t.product.bookAppointment}
            </Button>
            <Button href="/about#certification" variant="outline" size="md">
              {t.product.certificationStandards}
            </Button>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
