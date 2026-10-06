export type GemstoneCategoryName =
  | "Sapphire"
  | "Ruby"
  | "Star Sapphire"
  | "Rare Gemstone";

export interface GemstoneSummary {
  id: string;
  slug: string;
  name: string;
  category: GemstoneCategoryName;
  caratWeight: number;
  cut: string;
  colour: string;
  origin: string;
  image: string;
  gallery: string[];
  certification: string;
  description: string;
  /** Optional preview video; when present it autoplays as the primary media. */
  video?: string;
  /** Shown in the homepage "Featured Gemstones" grid. */
  featured?: boolean;
}
