import "server-only";
import { getGemstones } from "@/lib/catalog";
import { createBrevoClient } from "./brevo";
import { gemstoneToProduct } from "./products";
import { runNewsletterWorker } from "./worker";

/** All publicly published products. Every gemstone in the catalogue is live. */
export async function listPublishedProducts() {
  return (await getGemstones()).map(gemstoneToProduct);
}

export function runWorkerNow() {
  return runNewsletterWorker({ brevo: createBrevoClient(), listProducts: listPublishedProducts });
}
