import "server-only";
import { getGemstones } from "@/lib/store";
import { createBrevoClient } from "./brevo";
import { gemstoneToProduct } from "./products";
import { runNewsletterWorker } from "./worker";

/** All publicly published products. Every gemstone saved in the admin is live immediately. */
export async function listPublishedProducts() {
  return (await getGemstones()).map(gemstoneToProduct);
}

export function runWorkerNow() {
  return runNewsletterWorker({ brevo: createBrevoClient(), listProducts: listPublishedProducts });
}

/**
 * Called after a NEW gemstone is saved. Never throws: a newsletter problem must not break
 * publishing. Anything missed here is picked up by the scheduled worker.
 */
export async function announceAfterPublish() {
  try {
    await runWorkerNow();
  } catch (error) {
    console.error("Newsletter worker failed:", error instanceof Error ? error.message : "unknown error");
  }
}
