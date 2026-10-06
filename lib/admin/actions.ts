"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import {
  checkCredentials,
  createSession,
  destroySession,
  requireAdmin,
} from "@/lib/admin/auth";
import { imagePathError } from "@/lib/image-path";
import { announceAfterPublish } from "@/lib/newsletter/service";
import {
  addMedia,
  deleteGemstone,
  deleteMedia,
  getGemstoneById,
  getMedia,
  removeUploadedVideo,
  saveGemstone,
  updateMedia,
} from "@/lib/store";
import type { GemstoneCategoryName } from "@/types/gemstone";
import type { MediaType } from "@/types/media";

export interface FormState {
  error?: string;
}

const CATEGORIES: GemstoneCategoryName[] = ["Sapphire", "Ruby", "Star Sapphire", "Rare Gemstone"];

function refreshSite() {
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
}

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/* ------------------------------------ Session ------------------------------------ */

export async function signIn(_: FormState, form: FormData): Promise<FormState> {
  if (!checkCredentials(text(form, "username"), String(form.get("password") ?? ""))) {
    return { error: "Invalid username or password." };
  }
  await createSession();
  redirect("/admin");
}

export async function signOut() {
  await destroySession();
  redirect("/admin");
}

/* ------------------------------------ Shop ------------------------------------ */

export async function saveGemstoneAction(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();

  const id = text(form, "id") || undefined;
  const name = text(form, "name");
  const category = text(form, "category") as GemstoneCategoryName;
  const caratWeight = Number(text(form, "caratWeight"));
  const image = text(form, "image");

  if (!name) return { error: "Gemstone name is required." };
  if (!CATEGORIES.includes(category)) return { error: "Choose a valid category." };
  if (!Number.isFinite(caratWeight) || caratWeight <= 0) {
    return { error: "Carat weight must be a positive number." };
  }
  if (!image) return { error: "A main image is required." };

  const previous = id ? await getGemstoneById(id) : undefined;
  const gallery = form.getAll("gallery").map((v) => String(v).trim()).filter(Boolean);

  // Images are project paths; a value already saved on this record is kept as-is (legacy/external).
  const existingImages = previous ? [previous.image, ...previous.gallery] : [];
  for (const value of [image, ...gallery]) {
    const problem = imagePathError(value, existingImages);
    if (problem) return { error: problem };
  }
  const video = text(form, "video") || undefined;

  try {
    await saveGemstone(
      {
        slug: slugify(text(form, "slug") || name),
        name,
        category,
        caratWeight,
        cut: text(form, "cut"),
        colour: text(form, "colour"),
        origin: text(form, "origin"),
        certification: text(form, "certification"),
        description: text(form, "description"),
        image,
        gallery,
        video,
        featured: form.get("featured") === "on",
      },
      id,
    );
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save gemstone." };
  }

  // Drop uploaded videos that this edit no longer references (image files are never deleted).
  if (previous) {
    const kept = new Set([image, video, ...gallery]);
    for (const src of [previous.image, previous.video, ...previous.gallery]) {
      if (src && !kept.has(src)) await removeUploadedVideo(src);
    }
  }

  refreshSite();
  // Only a newly created gemstone can be a first publication; edits never announce.
  if (!id) after(announceAfterPublish);
  redirect("/admin/shop");
}

export async function deleteGemstoneAction(form: FormData) {
  await requireAdmin();
  const id = text(form, "id");
  const gemstone = await getGemstoneById(id);
  await deleteGemstone(id);
  if (gemstone) {
    for (const src of [gemstone.image, gemstone.video, ...gemstone.gallery]) {
      await removeUploadedVideo(src);
    }
  }
  refreshSite();
  revalidatePath("/admin/shop");
}

/* ------------------------------ Collections / Gallery ------------------------------ */

type MediaList = "collections" | "gallery";

function assertList(list: string): MediaList {
  if (list !== "collections" && list !== "gallery") throw new Error("Invalid list");
  return list;
}

export async function addMediaAction(
  list: string,
  src: string,
  type: MediaType,
  title: string,
): Promise<FormState> {
  await requireAdmin();
  if (type === "image") {
    src = src.trim();
    const problem = imagePathError(src);
    if (problem) return { error: problem };
  }
  await addMedia(assertList(list), { src, type, title: title.trim() || "Untitled" });
  refreshSite();
  revalidatePath(`/admin/${list}`);
  return {};
}

export async function updateMediaAction(form: FormData): Promise<FormState> {
  await requireAdmin();
  const list = assertList(text(form, "list"));
  const id = text(form, "id");
  const patch: { title: string; src?: string; type?: MediaType } = { title: text(form, "title") };

  const newSrc = text(form, "src");
  if (newSrc) {
    const existing = (await getMedia(list)).find((m) => m.id === id);
    const type = text(form, "type") === "video" ? "video" : "image";
    if (type === "image") {
      const problem = imagePathError(newSrc, existing ? [existing.src] : []);
      if (problem) return { error: problem };
    }
    patch.src = newSrc;
    patch.type = type;
    if (existing && existing.src !== newSrc) await removeUploadedVideo(existing.src);
  }

  await updateMedia(list, id, patch);
  refreshSite();
  revalidatePath(`/admin/${list}`);
  return {};
}

export async function deleteMediaAction(form: FormData) {
  await requireAdmin();
  const list = assertList(text(form, "list"));
  const id = text(form, "id");
  const item = (await getMedia(list)).find((m) => m.id === id);
  await deleteMedia(list, id);
  await removeUploadedVideo(item?.src);
  refreshSite();
  revalidatePath(`/admin/${list}`);
}
