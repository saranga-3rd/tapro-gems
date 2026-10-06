import fs from "node:fs/promises";
import path from "node:path";
import { BlobNotFoundError, BlobPreconditionFailedError, get, put } from "@vercel/blob";
import type { AnnouncedProduct } from "./templates";

/**
 * All newsletter data lives in ONE JSON document (no database):
 *  - local development: data/newsletter.json (git-ignored)
 *  - Vercel: a PRIVATE Blob (private/newsletter-state.json), written with ETag
 *    conditional writes so two serverless instances cannot overwrite each other.
 * Timestamps are ISO-8601 strings.
 */

export type SubscriberStatus = "pending" | "active" | "unsubscribed" | "suppressed";

export interface SubscriberRecord {
  email: string;
  emailNormalized: string;
  status: SubscriberStatus;
  suppressionReason: string | null;
  requestedAt: string;
  confirmedAt: string | null;
  unsubscribedAt: string | null;
  suppressedAt: string | null;
  consentSource: string;
  consentText: string;
  consentVersion: string;
  /** Only the SHA-256 of the confirmation token is stored. */
  tokenHash: string | null;
  tokenExpiresAt: string | null;
  tokenUsedAt: string | null;
  confirmationSentAt: string | null;
  confirmationSendCount: number;
  lastSendError: string | null;
  brevoContactId: number | null;
  brevoSyncStatus: "not_synced" | "synced" | "failed";
  brevoSyncError: string | null;
  brevoSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type JobStatus = "pending" | "campaign_created" | "sent" | "skipped" | "failed";

export interface JobRecord {
  productId: string;
  status: JobStatus;
  payload: AnnouncedProduct;
  campaignName: string;
  brevoCampaignId: number | null;
  attempts: number;
  nextAttemptAt: string;
  lockedUntil: string | null;
  lastError: string | null;
  /** "Accepted by Brevo for sending". Delivery is reported by Brevo, not tracked here. */
  acceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface State {
  subscribers: Record<string, SubscriberRecord>;
  /** Every product seen. Presence is the guard that a product is announced at most once. */
  products: Record<string, { type: string; baseline: boolean; firstSeenAt: string }>;
  baselineAt: string | null;
  jobs: Record<string, JobRecord>;
  webhookEvents: Record<string, string>;
  rateEvents: Record<string, string[]>;
}

const emptyState = (): State => ({
  subscribers: {},
  products: {},
  baselineAt: null,
  jobs: {},
  webhookEvents: {},
  rateEvents: {},
});

export class ConflictError extends Error {}

export interface StateStorage {
  load(): Promise<{ state: State; version: string | null }>;
  /** Must throw ConflictError if the stored version changed since `load`. */
  save(state: State, version: string | null): Promise<void>;
}

const FILE = path.join(process.cwd(), "data", "newsletter.json");
const BLOB_PATH = "private/newsletter-state.json";
const blobConfigured = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

const fileStorage: StateStorage = {
  async load() {
    try {
      return { state: { ...emptyState(), ...JSON.parse(await fs.readFile(FILE, "utf8")) }, version: null };
    } catch {
      return { state: emptyState(), version: null };
    }
  },
  async save(state) {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    const tmp = `${FILE}.${crypto.randomUUID()}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(state, null, 2));
    await fs.rename(tmp, FILE);
  },
};

const blobStorage: StateStorage = {
  async load() {
    try {
      const result = await get(BLOB_PATH, { access: "private", useCache: false });
      if (!result || result.statusCode !== 200) return { state: emptyState(), version: null };
      const text = await new Response(result.stream).text();
      return { state: { ...emptyState(), ...JSON.parse(text) }, version: result.blob.etag };
    } catch (error) {
      if (error instanceof BlobNotFoundError) return { state: emptyState(), version: null };
      throw error;
    }
  },
  async save(state, version) {
    try {
      await put(BLOB_PATH, JSON.stringify(state), {
        access: "private", // subscriber emails must never be publicly readable
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: version !== null,
        ...(version ? { ifMatch: version } : {}),
      });
    } catch (error) {
      if (error instanceof BlobPreconditionFailedError) throw new ConflictError();
      // Two first-time writers: the loser sees "already exists".
      if (version === null && error instanceof Error && /exist/i.test(error.message)) throw new ConflictError();
      throw error;
    }
  },
};

export function memoryStorage(): StateStorage {
  let data = JSON.stringify(emptyState());
  let version = 0;
  return {
    async load() {
      return { state: JSON.parse(data), version: String(version) };
    },
    async save(state, expected) {
      if (expected !== String(version)) throw new ConflictError();
      data = JSON.stringify(state);
      version++;
    },
  };
}

let override: StateStorage | undefined;
export function setStorageForTests(storage: StateStorage | undefined) {
  override = storage;
}
const storage = () => override ?? (blobConfigured() ? blobStorage : fileStorage);

// Serialises read-modify-write cycles inside one server instance.
let queue: Promise<unknown> = Promise.resolve();

/**
 * Atomic read-modify-write. `fn` must be synchronous and free of side effects (it may be
 * re-run after a cross-instance conflict). Do network calls OUTSIDE of it.
 */
export function mutate<T>(fn: (state: State) => T): Promise<T> {
  const run = queue.then(async () => {
    for (let attempt = 0; attempt < 8; attempt++) {
      const { state, version } = await storage().load();
      const before = JSON.stringify(state);
      const result = fn(state);
      if (JSON.stringify(state) === before) return result;
      try {
        await storage().save(state, version);
        return result;
      } catch (error) {
        if (!(error instanceof ConflictError)) throw error;
      }
    }
    throw new Error("Newsletter state is busy; please retry.");
  });
  queue = run.catch(() => {});
  return run;
}

export async function readState<T>(fn: (state: State) => T): Promise<T> {
  return fn((await storage().load()).state);
}
