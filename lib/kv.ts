import "server-only";
import { createHash } from "node:crypto";

/**
 * Minimal Upstash Redis REST client (no SDK). Works with the Upstash/Vercel Marketplace
 * integration, which provides either UPSTASH_REDIS_REST_* or KV_REST_API_* variables.
 */
const url = () => process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const token = () => process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

export const kvConfigured = () => Boolean(url() && token());

async function command<T>(...args: string[]): Promise<T> {
  const response = await fetch(url()!, {
    method: "POST",
    headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  const json = (await response.json().catch(() => ({}))) as { result?: T; error?: string };
  if (!response.ok || json.error) throw new Error(`Storage error: ${json.error ?? response.status}`);
  return json.result as T;
}

export const versionOf = (value: string) => createHash("sha1").update(value).digest("hex");

export async function kvGet(key: string): Promise<string | null> {
  return (await command<string | null>("GET", key)) ?? null;
}

const CAS = `
local cur = redis.call('GET', KEYS[1])
if (not cur and ARGV[1] == '') or (cur and redis.sha1hex(cur) == ARGV[1]) then
  redis.call('SET', KEYS[1], ARGV[2])
  return 1
end
return 0`;

/** Writes only if the stored value still has `expectedVersion` ("" = key must not exist). */
export async function kvCompareAndSet(
  key: string,
  expectedVersion: string | null,
  value: string,
): Promise<boolean> {
  return (await command<number>("EVAL", CAS, "1", key, expectedVersion ?? "", value)) === 1;
}
