import { beforeEach, describe, expect, it, vi } from "vitest";
import { validateEmail } from "@/lib/newsletter/email";
import { allowRequest } from "@/lib/newsletter/rate-limit";
import {
  applyProviderEvent,
  confirmSubscription,
  inspectToken,
  requestSubscription,
  retryPendingSyncs,
} from "@/lib/newsletter/subscribers";
import { FakeBrevo, LIST_ID, ORIGIN, serverError, subscriberCount, subscriberRow, tokenFrom, useTestDb } from "./helpers";

const T0 = new Date("2026-10-02T10:00:00Z");
const at = (ms: number) => new Date(T0.getTime() + ms);
const MIN = 60_000;

let brevo: FakeBrevo;
const deps = (now = T0) => ({ brevo, now, origin: ORIGIN });
const row = (email = "a@example.com") => subscriberRow(email) as unknown as Promise<Record<string, unknown>>;


beforeEach(async () => {
  process.env.BREVO_NEWSLETTER_LIST_ID = String(LIST_ID);
  await useTestDb();
  brevo = new FakeBrevo();
});

describe("email validation", () => {
  it.each(["", "   ", "plain", "a@b", "a@@b.com", "a b@c.com", "a@-b.com", "a@b..com", ".a@b.com", "a@b.c", `${"x".repeat(65)}@b.com`])(
    "rejects %j",
    (value) => expect(validateEmail(value).ok).toBe(false),
  );

  it("trims and lowercases for the unique identifier", () => {
    const r = validateEmail("  Jane.Doe+Gems@Example.COM ");
    expect(r).toEqual({ ok: true, email: "Jane.Doe+Gems@Example.COM", normalized: "jane.doe+gems@example.com" });
  });

  it("does not send mail for an invalid address", async () => {
    expect(await requestSubscription("nope", deps())).toEqual({ ok: false, reason: "invalid_email" });
    expect(brevo.sent).toHaveLength(0);
  });
});

describe("double opt-in", () => {
  it("creates a pending subscriber, emails a link, and does not activate or sync", async () => {
    const out = await requestSubscription("  A@Example.com ", deps());
    expect(out).toEqual({ ok: true, sent: true });
    const r = await row();
    expect(r).toMatchObject({ status: "pending", consentSource: "website-footer", brevoSyncStatus: "not_synced" });
    expect(r.consentText).toMatch(/new gemstones and jewellery/);
    expect(r.confirmedAt).toBeNull();
    expect(brevo.sent).toHaveLength(1);
    expect(brevo.sent[0].to).toBe("A@Example.com");
    expect(brevo.contacts.size).toBe(0);
  });

  it("stores only a hash of the token", async () => {
    await requestSubscription("a@example.com", deps());
    const token = tokenFrom(brevo);
    expect(token.length).toBeGreaterThanOrEqual(40);
    const r = await row();
    expect(r.tokenHash).not.toBe(token);
    expect(JSON.stringify(r)).not.toContain(token);
  });

  it("opening the link (inspect) is read-only; confirming activates and syncs to Brevo", async () => {
    await requestSubscription("a@example.com", deps());
    const token = tokenFrom(brevo);
    expect(await inspectToken(token, at(MIN))).toBe("valid");
    expect((await row()).status).toBe("pending");

    expect(await confirmSubscription(token, deps(at(MIN)))).toBe("confirmed");
    const r = await row();
    expect(r).toMatchObject({ status: "active", brevoSyncStatus: "synced" });
    expect(r.confirmedAt).not.toBeNull();
    expect(brevo.contacts.get("a@example.com")?.listIds).toEqual([LIST_ID]);
  });

  it("confirmation is idempotent", async () => {
    await requestSubscription("a@example.com", deps());
    const token = tokenFrom(brevo);
    expect(await confirmSubscription(token, deps(at(MIN)))).toBe("confirmed");
    expect(await confirmSubscription(token, deps(at(2 * MIN)))).toBe("used");
    expect(brevo.calls.filter((c) => c === "upsertContact")).toHaveLength(1);
  });

  it("rejects invalid and expired tokens", async () => {
    await requestSubscription("a@example.com", deps());
    const token = tokenFrom(brevo);
    expect(await confirmSubscription("not-a-token", deps())).toBe("invalid");
    expect(await confirmSubscription(token, deps(at(49 * 60 * MIN)))).toBe("expired");
    expect((await row()).status).toBe("pending");
  });

  it("keeps the subscriber active but retries when the Brevo sync fails", async () => {
    await requestSubscription("a@example.com", deps());
    const token = tokenFrom(brevo);
    brevo.fail("upsertContact", serverError());
    await confirmSubscription(token, deps(at(MIN)));
    expect(await row()).toMatchObject({ status: "active", brevoSyncStatus: "failed" });
    expect(await retryPendingSyncs(brevo, at(5 * MIN))).toBe(1);
    expect((await row()).brevoSyncStatus).toBe("synced");
  });

  it("never re-enables a contact Brevo has blocklisted", async () => {
    brevo.contacts.set("a@example.com", { id: 9, emailBlacklisted: true, listIds: [] });
    await requestSubscription("a@example.com", deps());
    await confirmSubscription(tokenFrom(brevo), deps(at(MIN)));
    expect(await row()).toMatchObject({ status: "suppressed", suppressionReason: "brevo_blocklisted" });
    expect(brevo.calls).not.toContain("upsertContact");
  });
});

describe("duplicates and cooldown", () => {
  it("does not create a second record or email inside the resend cooldown", async () => {
    await requestSubscription("a@example.com", deps());
    const again = await requestSubscription("A@EXAMPLE.COM", deps(at(30_000)));
    expect(again).toEqual({ ok: true, sent: false, reason: "cooldown" });
    expect(brevo.sent).toHaveLength(1);
    expect(await subscriberCount()).toBe(1);
  });

  it("resends after the cooldown with a new token that invalidates the old one", async () => {
    await requestSubscription("a@example.com", deps());
    const first = tokenFrom(brevo);
    expect(await requestSubscription("a@example.com", deps(at(3 * MIN)))).toEqual({ ok: true, sent: true });
    expect(brevo.sent).toHaveLength(2);
    expect(await inspectToken(first, at(4 * MIN))).toBe("invalid");
    expect(await inspectToken(tokenFrom(brevo), at(4 * MIN))).toBe("valid");
  });

  it("concurrent submissions send exactly one email", async () => {
    const results = await Promise.all(Array.from({ length: 5 }, () => requestSubscription("a@example.com", deps())));
    expect(results.filter((r) => r.ok && r.sent)).toHaveLength(1);
    expect(brevo.sent).toHaveLength(1);
  });

  it("does not email an active subscriber", async () => {
    await requestSubscription("a@example.com", deps());
    await confirmSubscription(tokenFrom(brevo), deps(at(MIN)));
    expect(await requestSubscription("a@example.com", deps(at(10 * MIN)))).toEqual({
      ok: true,
      sent: false,
      reason: "already_active",
    });
    expect(brevo.sent).toHaveLength(1);
  });

  it("releases the cooldown when Brevo fails to accept the confirmation email", async () => {
    brevo.fail("sendTransactional", serverError());
    expect(await requestSubscription("a@example.com", deps())).toEqual({ ok: false, reason: "send_failed" });
    expect(await requestSubscription("a@example.com", deps(at(1000)))).toEqual({ ok: true, sent: true });
  });

  it("rate limits by bucket within a window", async () => {
    for (let i = 0; i < 3; i++) expect(await allowRequest("ip:x", 3, 10 * MIN, at(i))).toBe(true);
    expect(await allowRequest("ip:x", 3, 10 * MIN, at(10))).toBe(false);
    expect(await allowRequest("ip:x", 3, 10 * MIN, at(11 * MIN))).toBe(true);
    expect(await allowRequest("ip:y", 3, 10 * MIN, at(10))).toBe(true);
  });
});

describe("unsubscribe, suppression and re-subscription", () => {
  async function activeSubscriber() {
    await requestSubscription("a@example.com", deps());
    await confirmSubscription(tokenFrom(brevo), deps(at(MIN)));
  }
  const ev = (over: Record<string, unknown>) => ({ event: "unsubscribe", email: "a@example.com", id: 1, ts_event: T0.getTime() / 1000 + 600, ...over });

  it("marks unsubscribed on a Brevo unsubscribe event, once", async () => {
    await activeSubscriber();
    expect(await applyProviderEvent(ev({ list_id: [LIST_ID] }) as never, at(20 * MIN))).toBe("applied");
    expect(await row()).toMatchObject({ status: "unsubscribed" });
    expect(await applyProviderEvent(ev({ list_id: [LIST_ID] }) as never, at(21 * MIN))).toBe("duplicate");
  });

  it("ignores unsubscribes from other lists", async () => {
    await activeSubscriber();
    expect(await applyProviderEvent(ev({ list_id: [999] }) as never, at(20 * MIN))).toBe("ignored");
    expect((await row()).status).toBe("active");
  });

  it.each([
    ["spam", "spam_complaint"],
    ["hard_bounce", "hard_bounce"],
  ])("suppresses on %s", async (event, reason) => {
    await activeSubscriber();
    await applyProviderEvent(ev({ event }) as never, at(20 * MIN));
    expect(await row()).toMatchObject({ status: "suppressed", suppressionReason: reason });
  });

  it("a suppressed address is never re-subscribed or emailed", async () => {
    await activeSubscriber();
    await applyProviderEvent(ev({ event: "hard_bounce" }) as never, at(20 * MIN));
    brevo.sent.length = 0;
    expect(await requestSubscription("a@example.com", deps(at(60 * MIN)))).toMatchObject({ sent: false, reason: "suppressed" });
    expect(brevo.sent).toHaveLength(0);
    expect((await row()).status).toBe("suppressed");
  });

  it("an unsubscribed person returns only through a fresh confirmation", async () => {
    await activeSubscriber();
    await applyProviderEvent(ev({}) as never, at(20 * MIN));
    expect(await requestSubscription("a@example.com", deps(at(60 * MIN)))).toEqual({ ok: true, sent: true });
    expect((await row()).status).toBe("pending"); // not active until they confirm
    expect(await confirmSubscription(tokenFrom(brevo), deps(at(61 * MIN)))).toBe("confirmed");
    expect((await row()).status).toBe("active");
  });

  it("a stale unsubscribe event cannot undo a newer confirmation", async () => {
    await activeSubscriber();
    const old = ev({ id: 77, ts_event: T0.getTime() / 1000 - 3600 });
    expect(await applyProviderEvent(old as never, at(30 * MIN))).toBe("ignored");
    expect((await row()).status).toBe("active");
  });

  it("ignores unrelated events", async () => {
    expect(await applyProviderEvent({ event: "opened", email: "a@example.com" }, T0)).toBe("ignored");
  });
});

vi.stubEnv("NODE_ENV", "test");
