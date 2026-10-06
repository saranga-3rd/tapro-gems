import Image from "next/image";
import Link from "@/components/i18n/LocaleLink";
import { categoryLabel } from "@/lib/data/gemstones";
import { getDictionary } from "@/lib/i18n/dictionary";
import ImageReveal from "@/components/motion/ImageReveal";

interface CategoryCardProps {
  name: string;
  image: string;
  href: string;
}

export default async function CategoryCard({ name, image, href }: CategoryCardProps) {
  const label = categoryLabel((await getDictionary()).shop.categories, name);
  return (
    <Link href={href} className="group block overflow-hidden rounded-2xl">
      <ImageReveal className="relative aspect-4/5 overflow-hidden">
        <Image
          src={image}
          alt={label}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-navy-950/70 via-transparent to-transparent" />
        <span className="absolute bottom-6 left-0 w-full text-center font-display text-lg text-ivory">
          {label}
        </span>
      </ImageReveal>
    </Link>
  );
}
