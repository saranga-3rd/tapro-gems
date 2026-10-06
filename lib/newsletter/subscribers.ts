import { createHash, randomBytes } from "node:crypto";
import { BrevoError, type BrevoClient } from "./brevo";
import {
  CONFIRMATION_TTL_MS,
  CONSENT_SOURCE_FOOTER,
  CONSENT_TEXT,
  CONSENT_VERSION,
  RESEND_COOLDOWN_MS,
  newsletterListId,
  siteUrl,
} from "./config";
import { validateEmail } from "./email";
import { mutate, readState, type State, type SubscriberRecord } from "./state";
import { confirmationEmail } from "./templates";

export type { SubscriberRecord, SubscriberStatus } from "./state";

export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
const newToken = () => randomBytes(32).toString("base64url");
const iso = (d: Date) => d.toISOString();
const ms = (value: string | null) => (value ? Date.parse(value) : 0);
const findByToken = (state: State, hash: string) =>
  Object.values(state.subscribers).find((s) => s.tokenHash === hash);

export type SubscribeOutcome =
  | { ok: false; reason: "invalid_email" }
  | { ok: false; reason: "send_failed" }
  /** `sent` is false when nothing needed to be emailed (see `reason`). */
  | { ok: true; sent: boolean; reason?: "already_active" | "suppressed" | "cooldown" };

export interface Deps {
  brevo: BrevoClient;
  now?: Date;
  /** Origin for confirmation links; defaults to SITE_URL. */
  origin?: string;
}

/**
 * Records a pending subscription and emails a confirmation link. Never activates marketing
 * delivery: only confirmSubscription() does that, after the recipient opens the emailed link.
 */
export async function requestSubscription(
  rawEmail: string,
  { brevo, now = new Date(), origin }: Deps,
  source = CONSENT_SOURCE_FOOTER,
): Promise<SubscribeOutcome> {
  const check = validateEmail(rawEmail);
  if (!check.ok) return { ok: false, reason: "invalid_email" };

  const token = newToken();
  const stamp = iso(now);
  const cutoff = now.getTime() - RESEND_COOLDOWN_MS;

  // Claim the send atomically (reserving the cooldown) so concurrent duplicates send once.
  const claim = await mutate((state) => {
    const existing = state.subscribers[check.normalized];
    if (existing?.status === "active") return { claimed: false as const, reason: "already_active" as const };
    if (existing?.status === "suppressed") return { claimed: false as const, reason: "suppressed" as const };
    if (existing && existing.confirmationSentAt && ms(existing.confirmationSentAt) > cutoff) {
      return { claimed: false as const, reason: "cooldown" as const };
    }
    const prevSentAt = existing?.confirmationSentAt ?? null;
    const base: SubscriberRecord = existing ?? {
      email: check.email,
      emailNormalized: check.normalized,
      status: "pending",
      suppressionReason: null,
      requestedAt: stamp,
      confirmedAt: null,
      unsubscribedAt: null,
      suppressedAt: null,
      consentSource: source,
      consentText: CONSENT_TEXT,
      consentVersion: CONSENT_VERSION,
      tokenHash: null,
      tokenExpiresAt: null,
      tokenUsedAt: null,
      confirmationSentAt: null,
      confirmationSendCount: 0,
      lastSendError: null,
      brevoContactId: null,
      brevoSyncStatus: "not_synced",
      brevoSyncError: null,
      brevoSyncedAt: null,
      createdAt: stamp,
      updatedAt: stamp,
    };
    state.subscribers[check.normalized] = {
      ...base,
      email: check.email,
      emailNormalized: check.normalized,
      // A returning (unsubscribed) person is pending again and must confirm afresh.
      status: "pending",
      requestedAt: stamp,
      consentSource: source,
      consentText: CONSENT_TEXT,
      consentVersion: CONSENT_VERSION,
      tokenHash: hashToken(token),
      tokenExpiresAt: iso(new Date(now.getTime() + CONFIRMATION_TTL_MS)),
      tokenUsedAt: null,
      confirmationSentAt: stamp,
      confirmationSendCount: base.confirmationSendCount + 1,
      updatedAt: stamp,
    };
    return { claimed: true as const, prevSentAt };
  });

  if (!claim.claimed) return { ok: true, sent: false, reason: claim.reason };

  const mail = confirmationEmail(`${origin ?? siteUrl()}/newsletter/confirm?token=${token}`);
  try {
    await brevo.sendTransactional({ to: check.email, subject: mail.subject, html: mail.html, text: mail.text });
  } catch (error) {
    // Release the cooldown so the visitor can retry at once. The token stays valid in case
    // Brevo actually delivered after a timeout.
    await mutate((state) => {
      const s = state.subscribers[check.normalized];
      if (s) {
        s.confirmationSentAt = claim.prevSentAt;
        s.lastSendError = error instanceof BrevoError ? error.message : "send failed";
      }
    });
    return { ok: false, reason: "send_failed" };
  }
  await mutate((state) => {
    const s = state.subscribers[check.normalized];
    if (s) s.lastSendError = null;
  });
  return { ok: true, sent: true };
}

export type TokenState = "valid" | "expired" | "invalid" | "used";

function tokenState(s: SubscriberRecord | undefined, now: Date): TokenState {
  if (!s) return "invalid";
  if (s.tokenUsedAt) return "used";
  if (s.status !== "pending") return "invalid";
  if (!s.tokenExpiresAt || ms(s.tokenExpiresAt) <= now.getTime()) return "expired";
  return "valid";
}

/** Read-only: safe for link scanners that prefetch the emailed URL. */
export async function inspectToken(token: string, now = new Date()): Promise<TokenState> {
  if (!token || token.length > 200) return "invalid";
  const hash = hashToken(token);
  return readState((state) => tokenState(findByToken(state, hash), now));
}

/** Idempotent: a second call with the same token reports "used" and changes nothing. */
export async function confirmSubscription(
  token: string,
  { brevo, now = new Date() }: Deps,
): Promise<Exclude<TokenState, "valid"> | "confirmed"> {
  if (!token || token.length > 200) return "invalid";
  const hash = hashToken(token);
  const outcome = await mutate((state) => {
    const s = findByToken(state, hash);
    const result = tokenState(s, now);
    if (result !== "valid" || !s) return { result, email: null };
    s.status = "active";
    s.confirmedAt = iso(now);
    s.tokenUsedAt = iso(now);
    s.unsubscribedAt = null;
    s.brevoSyncStatus = "not_synced";
    s.brevoSyncError = null;
    s.updatedAt = iso(now);
    return { result, email: s.emailNormalized };
  });
  if (!outcome.email) return outcome.result as Exclude<TokenState, "valid">;
  await syncSubscriber(outcome.email, brevo, now);
  return "confirmed";
}

/**
 * Adds a confirmed subscriber to the Brevo newsletter list. Respects provider-side
 * suppression: a blocklisted contact is never re-enabled; it is recorded as suppressed.
 * Only ever acts on status = 'active', i.e. people who confirmed.
 */
export async function syncSubscriber(emailNormalized: string, brevo: BrevoClient, now = new Date()) {
  const listId = newsletterListId();
  const stamp = iso(now);
  const update = (fn: (s: SubscriberRecord) => void) =>
    mutate((state) => {
      const s = state.subscribers[emailNormalized];
      if (s) {
        fn(s);
        s.updatedAt = stamp;
      }
    });
  try {
    const existing = await brevo.getContact(emailNormalized);
    if (existing?.emailBlacklisted) {
      await update((s) => {
        if (s.status !== "active") return;
        s.status = "suppressed";
        s.suppressionReason = "brevo_blocklisted";
        s.suppressedAt = stamp;
        s.brevoSyncStatus = "synced";
        s.brevoContactId = existing.id;
      });
      return;
    }
    await brevo.upsertContact(emailNormalized, listId);
    const verified = await brevo.getContact(emailNormalized);
    if (!verified?.listIds.includes(listId)) throw new Error("Contact is not on the newsletter list after sync.");
    await update((s) => {
      s.brevoSyncStatus = "synced";
      s.brevoSyncError = null;
      s.brevoSyncedAt = stamp;
      s.brevoContactId = verified.id;
    });
  } catch (error) {
    await update((s) => {
      s.brevoSyncStatus = "failed";
      s.brevoSyncError = error instanceof Error ? error.message.slice(0, 300) : "sync failed";
    });
  }
}

/** Retries failed/missing syncs for confirmed subscribers only. */
export async function retryPendingSyncs(brevo: BrevoClient, now = new Date(), limit = 25) {
  const due = await readState((state) =>
    Object.values(state.subscribers)
      .filter((s) => s.status === "active" && s.brevoSyncStatus !== "synced")
      .slice(0, limit)
      .map((s) => s.emailNormalized),
  );
  for (const email of due) await syncSubscriber(email, brevo, now);
  return due.length;
}

export interface ProviderEvent {
  event: string;
  email: string;
  id?: number | string;
  ts_event?: number;
  list_id?: number[];
  reason?: string;
}

const MAX_EVENT_KEYS = 5000;

/** Applies a Brevo marketing webhook event. Duplicate deliveries are ignored. */
export async function applyProviderEvent(
  payload: ProviderEvent,
  now = new Date(),
): Promise<"applied" | "duplicate" | "ignored"> {
  const kind =
    payload.event === "unsubscribe" || payload.event === "unsubscribed"
      ? "unsubscribe"
      : payload.event === "spam" || payload.event === "hard_bounce"
        ? payload.event
        : null;
  if (!kind || typeof payload.email !== "string") return "ignored";

  const email = payload.email.trim().toLowerCase();
  const key = createHash("sha256")
    .update([kind, email, payload.id ?? "", payload.ts_event ?? ""].join("|"))
    .digest("hex");

  // Ignore an unsubscribe for some other Brevo list.
  let otherList = false;
  if (kind === "unsubscribe" && Array.isArray(payload.list_id) && payload.list_id.length) {
    try {
      otherList = !payload.list_id.map(Number).includes(newsletterListId());
    } catch {
      // list not configured: fail safe by honouring the unsubscribe
    }
  }

  // An event older than the latest confirmation must not undo a fresh opt-in.
  const eventAt = payload.ts_event ? payload.ts_event * 1000 : now.getTime();
  const stamp = iso(now);

  return mutate((state) => {
    if (state.webhookEvents[key]) return "duplicate" as const;
    state.webhookEvents[key] = stamp;
    const keys = Object.keys(state.webhookEvents);
    for (const old of keys.slice(0, Math.max(0, keys.length - MAX_EVENT_KEYS))) delete state.webhookEvents[old];

    if (otherList) return "ignored" as const;
    const s = state.subscribers[email];
    if (!s) return "ignored" as const;
    const confirmedBefore = !s.confirmedAt || ms(s.confirmedAt) <= eventAt;

    if (kind === "unsubscribe") {
      if (s.status !== "active" || !confirmedBefore) return "ignored" as const;
      s.status = "unsubscribed";
      s.unsubscribedAt = iso(new Date(eventAt));
    } else {
      if (s.status === "suppressed" || !(s.status === "pending" || confirmedBefore)) return "ignored" as const;
      s.status = "suppressed";
      s.suppressionReason = kind === "spam" ? "spam_complaint" : "hard_bounce";
      s.suppressedAt = stamp;
    }
    s.updatedAt = stamp;
    return "applied" as const;
  });
}
