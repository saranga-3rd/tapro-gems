import { mutate, readState } from "./state";
import type { AnnouncedProduct } from "./templates";

/** The subset of the CMS gemstone record the newsletter needs. */
export interface GemstoneLike {
  id: string;
  slug: string;
  name: string;
  category: string;
  caratWeight: number;
  colour: string;
  origin: string;
  certification: string;
  description: string;
  image: string;
}

/**
 * Maps a CMS gemstone to an announcement. Only fields present in the data are included;
 * the CMS has no price or stock field, so none is ever shown.
 */
export function gemstoneToProduct(g: GemstoneLike): AnnouncedProduct {
  const details = [
    { label: "Carat weight", value: Number.isFinite(g.caratWeight) && g.caratWeight > 0 ? `${g.caratWeight.toFixed(2)} ct` : "" },
    { label: "Colour", value: g.colour },
    { label: "Origin", value: g.origin },
    { label: "Certification", value: g.certification },
  ].filter((d) => d.value && d.value.trim());
  return {
    id: g.id,
    type: "gemstone",
    path: `/shop/${encodeURIComponent(g.slug)}`,
    name: g.name,
    typeLabel: g.category || "Gemstone",
    description: g.description ?? "",
    image: g.image || undefined,
    details,
  };
}

export const hasBaseline = () => readState((state) => state.baselineAt !== null);

/**
 * Marks the existing catalogue as already published so it is never announced.
 * Idempotent; products published afterwards are announced once.
 */
export function establishBaseline(products: AnnouncedProduct[], now = new Date()) {
  return mutate((state) => {
    for (const p of products) {
      state.products[p.id] ??= { type: p.type, baseline: true, firstSeenAt: now.toISOString() };
    }
    state.baselineAt ??= now.toISOString();
  });
}

/**
 * Detects products that were not in the catalogue at the last check and enqueues exactly one
 * announcement job for each. Product record and job are created in ONE atomic write, and a
 * product id can only ever be recorded once, so repeats, edits and concurrent callers are no-ops.
 * `products` must be publicly published items only.
 */
export function enqueueNewProducts(
  products: AnnouncedProduct[],
  now = new Date(),
): Promise<{ enqueued: string[]; baselineMissing: boolean }> {
  const stamp = now.toISOString();
  return mutate((state) => {
    if (!state.baselineAt) return { enqueued: [], baselineMissing: true };
    const enqueued: string[] = [];
    for (const p of products) {
      if (state.products[p.id]) continue;
      state.products[p.id] = { type: p.type, baseline: false, firstSeenAt: stamp };
      state.jobs[p.id] = {
        productId: p.id,
        status: "pending",
        payload: p,
        campaignName: `tapro-product-${p.id}`,
        brevoCampaignId: null,
        attempts: 0,
        nextAttemptAt: stamp,
        lockedUntil: null,
        lastError: null,
        acceptedAt: null,
        createdAt: stamp,
        updatedAt: stamp,
      };
      enqueued.push(p.id);
    }
    return { enqueued, baselineMissing: false };
  });
}
