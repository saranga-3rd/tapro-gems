import "server-only";
import fs from "node:fs/promises";
import { cache } from "react";
import path from "node:path";
import { del, head, list, put } from "@vercel/blob";
import { seedGemstones } from "@/lib/data/gemstones";
import type { GemstoneSummary } from "@/types/gemstone";
import type { MediaItem } from "@/types/media";

/** Everything the admin dashboard manages, persisted as one JSON file. */
interface StoreData {
  gemstones: GemstoneSummary[];
  collections: MediaItem[];
  gallery: MediaItem[];
  /** Set once the bundled site images/videos have been imported into the gallery. */
  gallerySeeded?: boolean;
}

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "store.json");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

/** On Vercel the filesystem is read-only, so content and uploads live in Vercel Blob. */
export const USE_BLOB = Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
// Every save writes a NEW blob (store-<timestamp>.json) instead of overwriting one URL, so a
// stale CDN copy can never be served; reads pick the newest. "store.json" is the legacy name.
const BLOB_STORE_PREFIX = "admin/store-";
const BLOB_LEGACY_PATH = "admin/store.json";

const IMAGE_PATTERN = /\.(png|jpe?g|webp|avif)$/i;

async function seedCollections(): Promise<MediaItem[]> {
  const dir = path.join(process.cwd(), "public", "jew");
  const files = await fs.readdir(dir).catch(() => [] as string[]);
  return files
    .filter((file) => IMAGE_PATTERN.test(file))
    .sort()
    .map((file, index) => ({
      id: `seed-${index + 1}`,
      type: "image" as const,
      src: `/jew/${encodeURIComponent(file)}`,
      title: `Jewellery piece ${index + 1}`,
      createdAt: new Date(0).toISOString(),
    }));
}

const MEDIA_PATTERN = /\.(png|jpe?g|webp|avif|mp4|webm|mov)$/i;
const SKIP = new Set(["jew", "uploads"]);
const SKIP_FILES = new Set(["logo.png", "favicon.ico"]);

/** Every image and video bundled in public/ (except jewellery, which lives in Collections). */
async function seedGallery(): Promise<MediaItem[]> {
  const root = path.join(process.cwd(), "public");
  const found: string[] = [];
  const walk = async (dir: string, prefix: string) => {
    const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!prefix && SKIP.has(entry.name)) continue;
        await walk(path.join(dir, entry.name), `${prefix}${entry.name}/`);
      } else if (MEDIA_PATTERN.test(entry.name) && !SKIP_FILES.has(entry.name)) {
        found.push(`${prefix}${entry.name}`);
      }
    }
  };
  await walk(root, "");
  return found.sort().map((file, index) => ({
    id: `site-${index + 1}`,
    type: /\.(mp4|webm|mov)$/i.test(file) ? ("video" as const) : ("image" as const),
    src: `/${file.split("/").map(encodeURIComponent).join("/")}`,
    title: path.basename(file).replace(/\.[^.]+$/, ""),
    createdAt: new Date(0).toISOString(),
  }));
}

async function readRaw(): Promise<StoreData> {
  if (!USE_BLOB) return JSON.parse(await fs.readFile(STORE_FILE, "utf8")) as StoreData;
  const { blobs } = await list({ prefix: BLOB_STORE_PREFIX });
  const latest = blobs.sort((a, b) => b.pathname.localeCompare(a.pathname))[0];
  const url = latest ? latest.url : (await head(BLOB_LEGACY_PATH)).url; // throws on first run
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error("Could not read store.");
  return (await response.json()) as StoreData;
}

// Memoised per request: the dashboard reads several lists and must only hit Blob once.
const readStoreCached = cache(readStore);

async function readStore(): Promise<StoreData> {
  try {
    const data = await readRaw();
    if (!data.gallerySeeded) {
      data.gallery = [...(await seedGallery()), ...data.gallery];
      data.gallerySeeded = true;
      if (!USE_BLOB) await writeStore(data);
    }
    return data;
  } catch {
    const seeded: StoreData = {
      gemstones: seedGemstones,
      collections: await seedCollections(),
      gallery: await seedGallery(),
      gallerySeeded: true,
    };
    // On Blob, reads never write (parallel build/render workers would race); the first admin save persists.
    if (!USE_BLOB) await writeStore(seeded);
    return seeded;
  }
}

async function writeStore(data: StoreData) {
  if (USE_BLOB) {
    const pathname = `${BLOB_STORE_PREFIX}${String(Date.now()).padStart(15, "0")}.json`;
    const saved = await put(pathname, JSON.stringify(data), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: true, // two saves in the same millisecond must not collide
    });
    const { blobs } = await list({ prefix: BLOB_STORE_PREFIX });
    const stale = blobs.filter((b) => b.pathname < saved.pathname).map((b) => b.url);
    if (stale.length) await del(stale).catch(() => {});
    return;
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${STORE_FILE}.${crypto.randomUUID()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2));
  await fs.rename(tmp, STORE_FILE);
}

// Serialises read-modify-write cycles so concurrent admin requests cannot clobber each other.
let queue: Promise<unknown> = Promise.resolve();

async function mutate<T>(fn: (data: StoreData) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const data = await readStore();
    const result = await fn(data);
    await writeStore(data);
    return result;
  });
  queue = run.catch(() => {});
  return run;
}

/* ---------------------------------- Gemstones --------------------------------- */

export async function getGemstones(): Promise<GemstoneSummary[]> {
  return (await readStoreCached()).gemstones;
}

export async function getFeaturedGemstones(): Promise<GemstoneSummary[]> {
  return (await getGemstones()).filter((gemstone) => gemstone.featured);
}

export async function getGemstoneBySlug(slug: string): Promise<GemstoneSummary | undefined> {
  return (await getGemstones()).find((gemstone) => gemstone.slug === slug);
}

export async function getGemstoneById(id: string): Promise<GemstoneSummary | undefined> {
  return (await getGemstones()).find((gemstone) => gemstone.id === id);
}

export async function saveGemstone(
  input: Omit<GemstoneSummary, "id">,
  id?: string,
): Promise<GemstoneSummary> {
  return mutate((data) => {
    if (data.gemstones.some((g) => g.slug === input.slug && g.id !== id)) {
      throw new Error("Another gemstone already uses this URL slug.");
    }
    if (id) {
      const index = data.gemstones.findIndex((g) => g.id === id);
      if (index === -1) throw new Error("Gemstone not found.");
      data.gemstones[index] = { ...input, id };
      return data.gemstones[index];
    }
    const created = { ...input, id: crypto.randomUUID() };
    data.gemstones.push(created);
    return created;
  });
}

export async function deleteGemstone(id: string) {
  return mutate((data) => {
    data.gemstones = data.gemstones.filter((g) => g.id !== id);
  });
}

/* ------------------------------ Collections / Gallery ----------------------------- */

type MediaList = "collections" | "gallery";

export async function getMedia(list: MediaList): Promise<MediaItem[]> {
  return (await readStoreCached())[list];
}

export async function addMedia(list: MediaList, item: Omit<MediaItem, "id" | "createdAt">) {
  return mutate((data) => {
    const created: MediaItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    data[list].push(created);
    return created;
  });
}

export async function updateMedia(
  list: MediaList,
  id: string,
  patch: Partial<Pick<MediaItem, "title" | "src" | "type">>,
) {
  return mutate((data) => {
    const item = data[list].find((m) => m.id === id);
    if (!item) throw new Error("Item not found.");
    Object.assign(item, patch);
  });
}

export async function deleteMedia(list: MediaList, id: string) {
  return mutate((data) => {
    data[list] = data[list].filter((m) => m.id !== id);
  });
}

/**
 * Removes an orphaned uploaded VIDEO (Blob or local disk). Images are repository files under
 * public/ (or legacy Blob originals) and are never deleted here.
 */
export async function removeUploadedVideo(src: string | undefined) {
  if (!src || !/\.(mp4|webm|mov)$/i.test(src)) return;
  if (/^https:\/\/[^/]+\.blob\.vercel-storage\.com\//.test(src)) {
    await del(src).catch(() => {});
    return;
  }
  if (!src.startsWith("/media/")) return;
  const name = path.basename(decodeURIComponent(src));
  await fs.rm(path.join(UPLOAD_DIR, name), { force: true });
}
