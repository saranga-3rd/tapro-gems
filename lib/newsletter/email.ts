/** Shared by the footer form (client) and the API (server) so both apply the same rules. */

const LOCAL = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/;
const LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

/** Trim + lowercase. Plus-tags and dots are kept: they can be distinct mailboxes. */
export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export type EmailCheck = { ok: true; email: string; normalized: string } | { ok: false };

/**
 * Syntax check only. A well-formed address is not proof that the mailbox exists or
 * belongs to the visitor; the confirmation email is what verifies ownership.
 */
export function validateEmail(value: string): EmailCheck {
  const email = value.trim();
  const normalized = normalizeEmail(email);
  if (!normalized || normalized.length > 254) return { ok: false };
  const at = normalized.lastIndexOf("@");
  if (at < 1) return { ok: false };
  const local = normalized.slice(0, at);
  const domain = normalized.slice(at + 1);
  if (local.length > 64 || local.startsWith(".") || local.endsWith(".") || local.includes("..")) {
    return { ok: false };
  }
  if (!LOCAL.test(local)) return { ok: false };
  const labels = domain.split(".");
  if (labels.length < 2 || !labels.every((label) => LABEL.test(label))) return { ok: false };
  if (!/^[a-z]{2,}$|^xn--[a-z0-9-]+$/.test(labels[labels.length - 1])) return { ok: false };
  return { ok: true, email, normalized };
}
