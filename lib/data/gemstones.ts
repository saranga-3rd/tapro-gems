import type { GemstoneSummary } from "@/types/gemstone";

const certification =
  "Sri Lanka Gem & Jewellery Authority certified; GIA certification available on request.";

/** The product catalogue. Add images under public/images/gems and reference them here. */
export const seedGemstones: GemstoneSummary[] = [
  {
    id: "1",
    slug: "royal-blue-ceylon-sapphire",
    name: "Royal Blue Ceylon Sapphire",
    category: "Sapphire",
    caratWeight: 4.21,
    cut: "Cushion",
    colour: "Royal Blue",
    origin: "Ratnapura, Sri Lanka",
    image: "/Royal Blue Ceylon Sapphire.png",
    gallery: ["/sapphire.png"],
    video: "/videos/web/royal-blue-ceylon-sapphire.mp4",
    featured: true,
    certification,
    description:
      "A richly saturated royal blue sapphire from the gem fields of Ratnapura, cut to a classic cushion silhouette that maximises brilliance. Its even colour saturation and exceptional clarity make it a rare find even among Ceylon sapphires.",
  },
  {
    id: "2",
    slug: "pigeon-blood-ruby",
    name: "Pigeon Blood Ruby",
    category: "Ruby",
    caratWeight: 3.75,
    cut: "Oval",
    colour: "Vivid Red",
    origin: "Elahera, Sri Lanka",
    image: "/Pigeon Blood Ruby.png",
    video: "/videos/ruby-video.mp4",
    gallery: ["/ruby.png"],
    certification,
    description:
      "A vivid, high-saturation red ruby from Elahera, prized for its rare pigeon-blood hue. Hand-selected for its clarity and depth of colour, this oval-cut stone is exceptionally scarce in natural, untreated form.",
  },
  {
    id: "3",
    slug: "natural-star-sapphire",
    name: "Natural Star Sapphire",
    category: "Star Sapphire",
    caratWeight: 6.02,
    cut: "Cabochon",
    colour: "Cornflower Blue",
    origin: "Ratnapura, Sri Lanka",
    image: "/Natural Star Sapphire.png",
    gallery: ["/star-sapphire.png"],
    video: "/videos/web/star-sapphire.mp4",
    certification,
    description:
      "A cornflower-blue star sapphire displaying a sharp six-ray asterism when moved under light, formed naturally over millions of years. Cut en cabochon to showcase its silk inclusions and natural star effect.",
  },
  {
    id: "4",
    slug: "padparadscha-sapphire",
    name: "Padparadscha Sapphire",
    category: "Rare Gemstone",
    caratWeight: 3.14,
    cut: "Emerald",
    colour: "Pink-Orange",
    origin: "Ratnapura, Sri Lanka",
    image: "/Padparadscha Sapphire.png",
    video: "/videos/padparadscha-sapphire.mp4",
    gallery: ["/Padparadscha Sapphire.png"],
    certification,
    description:
      "An exceptionally rare pink-orange padparadscha sapphire, named for the lotus blossom it resembles. Its delicate, even colour zoning and emerald cut make it a coveted centrepiece for collectors.",
  },
  {
    id: "5",
    slug: "alexandrite",
    name: "Alexandrite",
    category: "Rare Gemstone",
    caratWeight: 1.92,
    cut: "Oval",
    colour: "Teal-Green to Purple-Red",
    origin: "Ratnapura, Sri Lanka",
    image: "/gems/alexandrite.png",
    gallery: ["/gems/alexandrite.png"],
    video: "/videos/web/alexandrite.mp4",
    featured: true,
    certification,
    description:
      "A natural alexandrite celebrated for its dramatic colour change, shifting from teal-green in daylight to a warm purple-red under incandescent light. Among the rarest of all gemstones, this oval-cut stone is a true collector's piece.",
  },
  {
    id: "6",
    slug: "purple-sapphire",
    name: "Purple Sapphire",
    category: "Sapphire",
    caratWeight: 3.48,
    cut: "Cushion",
    colour: "Violet-Purple",
    origin: "Ratnapura, Sri Lanka",
    image: "/gems/purple-sapphire.png",
    gallery: ["/gems/purple-sapphire.png"],
    video: "/videos/web/purple-sapphire.mp4",
    featured: true,
    certification,
    description:
      "A rich violet-purple sapphire with an even, velvety saturation and lively brilliance. Hand-selected in Ratnapura and cut to a cushion shape, it offers a distinctive alternative to the classic blue.",
  },
  {
    id: "7",
    slug: "yellow-sapphire",
    name: "Yellow Sapphire",
    category: "Sapphire",
    caratWeight: 5.07,
    cut: "Oval",
    colour: "Golden Yellow",
    origin: "Ratnapura, Sri Lanka",
    image: "/gems/yellow-sapphire.png",
    gallery: ["/gems/yellow-sapphire.png"],
    video: "/videos/web/yellow-sapphire-2.mp4",
    featured: true,
    certification,
    description:
      "A luminous golden-yellow sapphire with excellent transparency and a warm, sunlit glow. Cut to a generous oval, this natural Ceylon stone pairs exceptional clarity with lasting, everyday brilliance.",
  },
  {
    id: "8",
    slug: "cats-eye",
    name: "Cat's Eye",
    category: "Rare Gemstone",
    caratWeight: 5.0, // TODO: confirm the real weight
    cut: "Cabochon",
    colour: "Honey Gold",
    origin: "Sri Lanka",
    image: "/images/gems/cat-eye.png",
    gallery: ["/images/gems/cat-eye.png"],
    video: "/videos/web/cat-eye-video.mp4",
    certification,
    description:
      "A natural cat's eye displaying a sharp, silky band of light that glides across its honey-gold body as the stone is moved. Cut en cabochon to showcase this chatoyant effect, it is one of Sri Lanka's most distinctive and sought-after rare gemstones.",
  },
];

export interface GemstoneCategory {
  name: string;
  slug: string;
  description: string;
  image: string;
  /** Representative gemstone this category links to and borrows its video from. */
  gemstoneSlug: string;
}

export const gemstoneCategories: GemstoneCategory[] = [
  {
    name: "Sapphire",
    slug: "sapphire",
    description: "The signature Ceylon blue — hand-selected and certified for depth of colour.",
    image: "/sapphire.png",
    gemstoneSlug: "royal-blue-ceylon-sapphire",
  },
  {
    name: "Ruby",
    slug: "ruby",
    description: "Rare Sri Lankan rubies prized for their vivid, pigeon-blood tone.",
    image: "/ruby.png",
    gemstoneSlug: "pigeon-blood-ruby",
  },
  {
    name: "Star Sapphire",
    slug: "star-sapphire",
    description: "Natural asterism formed over millions of years, cut en cabochon.",
    image: "/star-sapphire.png",
    gemstoneSlug: "natural-star-sapphire",
  },
  {
    name: "Yellow Sapphire",
    slug: "yellow-sapphire",
    description: "Exceptional and unusual stones sourced for the discerning collector.",
    image: "/gems/yellow-sapphire.png",
    gemstoneSlug: "yellow-sapphire",
  },
];

/** Localised display label for a gemstone category value; unknown (admin-added) categories show as stored. */
export function categoryLabel(labels: Record<string, string>, category: string): string {
  return labels[category] ?? category;
}
