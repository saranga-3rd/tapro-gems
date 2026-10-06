import { createHash } from "node:crypto";
import { mutate } from "./state";

export const hashForBucket = (value: string) =>
  createHash("sha256").update(`tapro-newsletter:${value}`).digest("hex").slice(0, 32);

/**
 * Fixed-window limiter persisted in the newsletter state (serverless instances share no memory).
 * Returns false when the caller has used up `max` hits within `windowMs`. Only hashed keys are stored.
 */
export function allowRequest(bucket: string, max: number, windowMs: number, now = new Date()): Promise<boolean> {
  const since = now.getTime() - windowMs;
  const dayAgo = now.getTime() - 24 * 60 * 60 * 1000;
  return mutate((state) => {
    // Opportunistic cleanup of long-expired buckets.
    for (const [key, hits] of Object.entries(state.rateEvents)) {
      const recent = hits.filter((t) => Date.parse(t) > dayAgo);
      if (recent.length) state.rateEvents[key] = recent;
      else delete state.rateEvents[key];
    }
    const hits = (state.rateEvents[bucket] ?? []).filter((t) => Date.parse(t) > since);
    if (hits.length >= max) {
      state.rateEvents[bucket] = hits;
      return false;
    }
    state.rateEvents[bucket] = [...(state.rateEvents[bucket] ?? []).filter((t) => Date.parse(t) > dayAgo), now.toISOString()];
    return true;
  });
}
