import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import { seedGemstones } from "@/lib/data/gemstones";
import type { GemstoneSummary } from "@/types/gemstone";
import type { MediaItem } from "@/types/media";

/**
 * The site catalogue. Products come from lib/data/gemstones.ts; the Collections and Gallery pages
 * list the media files committed under public/. To change content, edit those and redeploy.
 */

const IMAGE_PATTERN = /\.(png|jpe?g|webp|avif)$/i;
const MEDIA_PATTERN = /\.(png|jpe?g|webp|avif|mp4|webm|mov)$/i;
const VIDEO_PATTERN = /\.(mp4|webm|mov)$/i;
const SKIP_FILES = new Set(["logo.png", "favicon.ico"]);
const PUBLIC_DIR = path.join(process.cwd(), "public");

const toSrc = (file: string) => `/${file.split("/").map(encodeURIComponent).join("/")}`;
const epoch = new Date(0).toISOString();

/** "gold-floral-necklace.png" -> "Gold floral necklace". */
const titleFromFile = (file: string) => {
  const words = file.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

/** Jewellery pieces: every image in public/jew, titled from its filename. */
const loadCollections = cache(async (): Promise<MediaItem[]> => {
  const files = await fs.readdir(path.join(PUBLIC_DIR, "jew")).catch(() => [] as string[]);
  return files
    .filter((file) => IMAGE_PATTERN.test(file))
    .sort()
    .map((file, index) => ({
      id: `collection-${index + 1}`,
      type: "image" as const,
      src: toSrc(`jew/${file}`),
      title: titleFromFile(file),
      createdAt: epoch,
    }));
});

/** Gallery: every image and video in public/ except jewellery and the gems/site image folders. */
const loadGallery = cache(async (): Promise<MediaItem[]> => {
  const found: string[] = [];
  const walk = async (dir: string, prefix: string) => {
    const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      const relative = `${prefix}${entry.name}`;
      if (entry.isDirectory()) {
        if (relative === "jew" || relative === "images/gems" || relative === "images/site") continue;
        await walk(path.join(dir, entry.name), `${relative}/`);
      } else if (MEDIA_PATTERN.test(entry.name) && !SKIP_FILES.has(entry.name)) {
        found.push(relative);
      }
    }
  };
  await walk(PUBLIC_DIR, "");
  return found.sort().map((file, index) => ({
    id: `gallery-${index + 1}`,
    type: VIDEO_PATTERN.test(file) ? ("video" as const) : ("image" as const),
    src: toSrc(file),
    title: path.basename(file).replace(/\.[^.]+$/, ""),
    createdAt: epoch,
  }));
});

export async function getGemstones(): Promise<GemstoneSummary[]> {
  return seedGemstones;
}

export async function getFeaturedGemstones(): Promise<GemstoneSummary[]> {
  return seedGemstones.filter((gemstone) => gemstone.featured);
}

export async function getGemstoneBySlug(slug: string): Promise<GemstoneSummary | undefined> {
  return seedGemstones.find((gemstone) => gemstone.slug === slug);
}

export async function getMedia(list: "collections" | "gallery"): Promise<MediaItem[]> {
  return list === "collections" ? loadCollections() : loadGallery();
}
