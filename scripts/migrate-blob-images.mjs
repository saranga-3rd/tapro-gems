#!/usr/bin/env node
/**
 * Moves image references from Vercel Blob to repository files under public/images.
 *
 *   node --env-file=.env.local scripts/migrate-blob-images.mjs                 # dry run (default): report only
 *   node --env-file=.env.local scripts/migrate-blob-images.mjs --download      # download + verify into public/images, write manifest
 *   node --env-file=.env.local scripts/migrate-blob-images.mjs --apply --site-url https://your-site
 *                                                                              # back up the store, then rewrite verified references
 *   ... --apply --dry-run --site-url https://your-site                         # run every check, write nothing
 *
 * Safe by design:
 *  - Without --download / --apply nothing is written anywhere.
 *  - Blob files are NEVER deleted. Videos and non-Blob URLs are left untouched.
 *  - --apply only rewrites a reference when its local file exists, is a valid image whose hash
 *    matches the manifest, AND the deployed site serves it (--site-url). Anything else keeps its
 *    original URL and is reported.
 *  - The store is backed up to migration/backups/ before any write; the previous store blob stays
 *    in Blob until the app's next normal save prunes older store snapshots.
 *  - Credentials are read from the environment and never printed.
 *
 * The store is read from Blob (BLOB_READ_WRITE_TOKEN or BLOB_STORE_ID). With no Blob credentials
 * it falls back to the local data/store.json, read-only.
 */
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { head, list, put } from "@vercel/blob";

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, "migration", "blob-image-manifest.json");
const BACKUP_DIR = path.join(ROOT, "migration", "backups");
const LOCAL_STORE = path.join(ROOT, "data", "store.json");
const BLOB_STORE_PREFIX = "admin/store-";
const BLOB_LEGACY_PATH = "admin/store.json";
const BLOB_URL = /^https:\/\/[^/]+\.blob\.vercel-storage\.com\//i;

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};
const DOWNLOAD = flag("--download");
const APPLY = flag("--apply");
const DRY_RUN = flag("--dry-run");
const SITE_URL = option("--site-url")?.replace(/\/+$/, "");
const hasBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

/* ---------------------------------- image checks ---------------------------------- */

/** Detects png/jpeg/webp/avif from magic bytes; null when the bytes are not a supported image. */
function detectImage(buf) {
  if (buf.length < 12) return null;
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "webp";
  if (buf.toString("ascii", 4, 8) === "ftyp" && /^avi[fs]$/.test(buf.toString("ascii", 8, 12))) return "avif";
  return null;
}

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

function slugPart(value) {
  return (
    value
      .normalize("NFKD")
      .replace(/[^A-Za-z0-9._-]+/g, "-")
      .replace(/^[-.]+|[-.]+$/g, "")
      .toLowerCase()
      .slice(0, 60) || "image"
  );
}

/** Deterministic, collision-free local path: <folder>/<name>-<hash of the URL>.<ext>. */
function localPathFor(url, folder, ext) {
  const pathname = decodeURIComponent(new URL(url).pathname);
  const base = slugPart(path.basename(pathname).replace(/\.[^.]+$/, ""));
  const hash = createHash("sha1").update(url).digest("hex").slice(0, 8);
  return `/images/${folder}/${base}-${hash}.${ext}`;
}

const urlExt = (url) => {
  const m = /\.(png|jpe?g|webp|avif)$/i.exec(new URL(url).pathname);
  return m ? m[1].toLowerCase().replace("jpeg", "jpg") : null;
};

/* ------------------------------------- the store ------------------------------------ */

async function readStore() {
  if (!hasBlob) {
    console.warn("No Blob credentials in the environment: reading local data/store.json (read-only).");
    return { data: JSON.parse(await fs.readFile(LOCAL_STORE, "utf8")), source: "local" };
  }
  const { blobs } = await list({ prefix: BLOB_STORE_PREFIX });
  const latest = blobs.sort((a, b) => b.pathname.localeCompare(a.pathname))[0];
  const url = latest ? latest.url : (await head(BLOB_LEGACY_PATH)).url;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Could not read the store (HTTP ${response.status}).`);
  return { data: await response.json(), source: "blob" };
}

/** Every image reference in the store, with where it lives and which folder it belongs in. */
function collectReferences(data) {
  const refs = [];
  for (const g of data.gemstones ?? []) {
    if (g.image) refs.push({ url: g.image, folder: "gems", where: { list: "gemstones", id: g.id, field: "image" } });
    (g.gallery ?? []).forEach((url, index) =>
      refs.push({ url, folder: "gems", where: { list: "gemstones", id: g.id, field: `gallery[${index}]` } }),
    );
  }
  for (const key of ["collections", "gallery"]) {
    for (const item of data[key] ?? []) {
      if (item.type === "image") refs.push({ url: item.src, folder: "gallery", where: { list: key, id: item.id, field: "src" } });
    }
  }
  return refs;
}

function rewriteReferences(data, mapping) {
  let changed = 0;
  const swap = (url) => {
    if (mapping.has(url)) {
      changed += 1;
      return mapping.get(url);
    }
    return url;
  };
  for (const g of data.gemstones ?? []) {
    if (g.image) g.image = swap(g.image);
    g.gallery = (g.gallery ?? []).map(swap);
  }
  for (const key of ["collections", "gallery"]) {
    for (const item of data[key] ?? []) if (item.type === "image") item.src = swap(item.src);
  }
  return changed;
}

/* ------------------------------------- stages ---------------------------------------- */

function buildManifest(refs) {
  const byUrl = new Map();
  for (const ref of refs) {
    if (!BLOB_URL.test(ref.url)) continue;
    const entry = byUrl.get(ref.url) ?? { url: ref.url, folder: ref.folder, usedBy: [] };
    entry.usedBy.push(ref.where);
    byUrl.set(ref.url, entry);
  }
  return [...byUrl.values()].map((entry) => {
    const ext = urlExt(entry.url);
    return { ...entry, localPath: ext ? localPathFor(entry.url, entry.folder, ext) : null, status: "pending" };
  });
}

async function download(entry) {
  try {
    const response = await fetch(entry.url);
    if (!response.ok) return { ...entry, status: "failed", reason: `HTTP ${response.status}` };
    const buf = Buffer.from(await response.arrayBuffer());
    const ext = detectImage(buf);
    if (!ext) return { ...entry, status: "failed", reason: "downloaded bytes are not a valid png/jpeg/webp/avif image" };
    const localPath = localPathFor(entry.url, entry.folder, ext);
    const file = path.join(ROOT, "public", localPath);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, buf); // original bytes: no re-encoding, so quality is untouched
    const check = await fs.readFile(file);
    if (!detectImage(check) || sha256(check) !== sha256(buf)) {
      return { ...entry, status: "failed", reason: "file written to disk did not verify" };
    }
    return { ...entry, localPath, status: "downloaded", bytes: buf.length, sha256: sha256(buf), type: ext };
  } catch (error) {
    return { ...entry, status: "failed", reason: error instanceof Error ? error.message : String(error) };
  }
}

/** True when the local file is a valid image matching the manifest hash. */
async function verifyLocal(entry) {
  if (!entry.localPath || !entry.sha256) return "not downloaded";
  const buf = await fs.readFile(path.join(ROOT, "public", entry.localPath)).catch(() => null);
  if (!buf) return "local file missing";
  if (!detectImage(buf)) return "local file is not a valid image";
  if (sha256(buf) !== entry.sha256) return "local file differs from the manifest";
  return null;
}

async function verifyDeployed(entry) {
  const response = await fetch(`${SITE_URL}${encodeURI(entry.localPath)}`, { method: "GET" }).catch(() => null);
  if (!response?.ok) return `not served by ${SITE_URL} (HTTP ${response?.status ?? "n/a"})`;
  if (!(response.headers.get("content-type") ?? "").startsWith("image/")) return "deployed URL is not an image";
  return null;
}

async function main() {
  const { data, source } = await readStore();
  const refs = collectReferences(data);
  const blobCount = refs.filter((r) => BLOB_URL.test(r.url)).length;
  const otherExternal = [...new Set(refs.filter((r) => /^https?:\/\//i.test(r.url) && !BLOB_URL.test(r.url)).map((r) => r.url))];
  console.log(`Store source: ${source}. Image references: ${refs.length} (Blob: ${blobCount}, other external: ${otherExternal.length}).`);

  if (APPLY) return apply(data, source);

  let manifest = buildManifest(refs);
  if (DOWNLOAD) {
    manifest = await Promise.all(manifest.map(download));
    await fs.mkdir(path.dirname(MANIFEST_PATH), { recursive: true });
    await fs.writeFile(MANIFEST_PATH, JSON.stringify({ generatedAt: new Date().toISOString(), entries: manifest }, null, 2));
    console.log(`Manifest written to ${path.relative(ROOT, MANIFEST_PATH)}.`);
  } else {
    console.log("DRY RUN: nothing downloaded or written. Proposed mapping:");
  }
  for (const e of manifest) {
    console.log(`  [${e.status}] ${e.url}\n      -> ${e.localPath ?? "(extension decided after download)"}${e.reason ? `  (${e.reason})` : ""}`);
  }
  if (otherExternal.length) console.log("Non-Blob external URLs (left untouched):\n  " + otherExternal.join("\n  "));
  const failed = manifest.filter((e) => e.status === "failed");
  if (failed.length) console.log(`\nUNRESOLVED (${failed.length}) - original references are kept:\n  ` + failed.map((e) => `${e.url} - ${e.reason}`).join("\n  "));
  if (DOWNLOAD) console.log("\nNext: review public/images, commit, push and deploy; then run with --apply --site-url <deployed site>.");
}

async function apply(data, source) {
  if (source !== "blob") throw new Error("--apply needs Blob credentials (it writes a new store snapshot).");
  if (!SITE_URL) throw new Error("--apply needs --site-url <deployed site> to confirm the images are live first.");
  const manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, "utf8")).entries;
  const mapping = new Map();
  const unresolved = [];
  for (const entry of manifest) {
    const problem = (await verifyLocal(entry)) ?? (await verifyDeployed(entry));
    if (problem) unresolved.push(`${entry.url} - ${problem}`);
    else mapping.set(entry.url, entry.localPath);
  }

  if (DRY_RUN) {
    console.log(`DRY RUN: ${mapping.size} reference(s) would be rewritten; nothing written.`);
    if (unresolved.length) console.log(`UNRESOLVED (${unresolved.length}) - would keep original URLs:\n  ` + unresolved.join("\n  "));
    return;
  }
  await fs.mkdir(BACKUP_DIR, { recursive: true });
  const backup = path.join(BACKUP_DIR, `store-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  await fs.writeFile(backup, JSON.stringify(data, null, 2));
  console.log(`Backed up the current store to ${path.relative(ROOT, backup)}.`);

  const changed = rewriteReferences(data, mapping);
  if (unresolved.length) console.log(`UNRESOLVED (${unresolved.length}) - original references are kept:\n  ` + unresolved.join("\n  "));
  if (!changed) return console.log("No references to update.");

  const saved = await put(`${BLOB_STORE_PREFIX}${String(Date.now()).padStart(15, "0")}.json`, JSON.stringify(data), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: true,
  });
  console.log(`Updated ${changed} reference(s); new store snapshot ${saved.pathname}. No Blob files were deleted.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
