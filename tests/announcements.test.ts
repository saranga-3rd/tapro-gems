import { beforeEach, describe, expect, it } from "vitest";
import { enqueueNewProducts, gemstoneToProduct, hasBaseline } from "@/lib/newsletter/products";
import { confirmSubscription, requestSubscription } from "@/lib/newsletter/subscribers";
import { absoluteHttpsUrl, announcementEmail } from "@/lib/newsletter/templates";
import { MAX_ATTEMPTS, backoffMs, runNewsletterWorker } from "@/lib/newsletter/worker";
import { FakeBrevo, LIST_ID, ORIGIN, allJobs, badRequest, rateLimited, serverError, timeout, tokenFrom, useTestDb } from "./helpers";

const T0 = new Date("2026-10-02T10:00:00Z");
const at = (ms: number) => new Date(T0.getTime() + ms);
const MIN = 60_000;

const gem = (over: Partial<Parameters<typeof gemstoneToProduct>[0]> = {}) =>
  gemstoneToProduct({
    id: "gem-1",
    slug: "blue-sapphire",
    name: "Royal Blue <Sapphire>",
    category: "Sapphire",
    caratWeight: 3.25,
    colour: "Royal Blue",
    origin: "Sri Lanka",
    certification: "",
    description: "A <b>rare</b> stone.",
    image: "https://x.public.blob.vercel-storage.com/a.jpg",
    ...over,
  });

let brevo: FakeBrevo;
const jobs = () => allJobs() as unknown as Promise<Record<string, unknown>[]>;
const run = (now = T0, products?: ReturnType<typeof gem>[]) =>
  runNewsletterWorker({ brevo, now, origin: ORIGIN, listProducts: products ? async () => products : undefined });

async function addSubscriber(email = "a@example.com") {
  await requestSubscription(email, { brevo, now: T0, origin: ORIGIN });
  await confirmSubscription(tokenFrom(brevo), { brevo, now: at(MIN) });
  brevo.calls.length = 0;
}

beforeEach(async () => {
  process.env.BREVO_NEWSLETTER_LIST_ID = String(LIST_ID);
  process.env.BREVO_SENDER_EMAIL = "news@taprogems.test";
  await useTestDb();
  brevo = new FakeBrevo();
});

describe("publication detection", () => {
  it("baselines the existing catalogue on first run and announces nothing", async () => {
    await addSubscriber();
    const r = await run(at(5 * MIN), [gem(), gem({ id: "gem-2", slug: "ruby" })]);
    expect(r).toMatchObject({ baselined: 2, enqueued: 0 });
    expect(await hasBaseline()).toBe(true);
    expect(await jobs()).toHaveLength(0);
    expect(brevo.campaigns.size).toBe(0);
  });

  it("a new public product triggers exactly one announcement; edits and rescans trigger none", async () => {
    await addSubscriber();
    await run(at(5 * MIN), [gem()]); // baseline
    const added = gem({ id: "gem-2", slug: "ruby", name: "Ruby" });
    const first = await run(at(6 * MIN), [gem(), added]);
    expect(first.enqueued).toBe(1);
    expect(first.jobs.map((j) => j.outcome)).toEqual(["sent"]);

    const edited = gem({ id: "gem-2", slug: "ruby", name: "Ruby (edited)", description: "changed" });
    const again = await run(at(7 * MIN), [gem(), edited]);
    expect(again.enqueued).toBe(0);
    expect(await jobs()).toHaveLength(1);
    expect(brevo.campaigns.size).toBe(1);
    expect([...brevo.campaigns.values()][0].status).toBe("queued");
  });

  it("does not enqueue before a baseline exists (hook can never announce the old catalogue)", async () => {
    expect(await enqueueNewProducts([gem()], T0)).toEqual({ enqueued: [], baselineMissing: true });
    expect(await jobs()).toHaveLength(0);
  });

  it("concurrent detection creates a single job", async () => {
    await run(T0, []);
    const results = await Promise.all(Array.from({ length: 6 }, () => enqueueNewProducts([gem()], at(MIN))));
    expect(results.flatMap((r) => r.enqueued)).toHaveLength(1);
    expect(await jobs()).toHaveLength(1);
  });

  it("skips (without a campaign) when nobody has confirmed yet", async () => {
    await run(T0, []);
    const r = await run(at(MIN), [gem()]);
    expect(r.jobs[0].outcome).toBe("skipped");
    expect(brevo.campaigns.size).toBe(0);
  });
});

describe("campaign content", () => {
  it("includes product facts, image, product link and unsubscribe, escaping dynamic text", () => {
    const { html, subject } = announcementEmail(gem(), ORIGIN);
    expect(subject).toBe("New at Tapro Gems: Royal Blue <Sapphire>");
    expect(html).toContain("Royal Blue &lt;Sapphire&gt;");
    expect(html).not.toContain("<Sapphire>");
    expect(html).toContain("A &lt;b&gt;rare&lt;/b&gt; stone.");
    expect(html).toContain('src="https://x.public.blob.vercel-storage.com/a.jpg"');
    expect(html).toContain(`href="${ORIGIN}/shop/blue-sapphire"`);
    expect(html).toContain("{{ unsubscribe }}");
    expect(html).toContain("3.25 ct");
    expect(html).not.toMatch(/Certification|€|\$|price/i); // certification empty, no price in data
  });

  it("shows certification only when present and tolerates a missing image", () => {
    const { html } = announcementEmail(gem({ certification: "GIA", image: "" }), ORIGIN);
    expect(html).toContain("GIA");
    expect(html).not.toContain("<img");
  });

  it("builds absolute https image URLs and refuses http", () => {
    expect(absoluteHttpsUrl("/jew/a.png", ORIGIN)).toBe(`${ORIGIN}/jew/a.png`);
    expect(absoluteHttpsUrl("http://insecure.test/a.png", ORIGIN)).toBeUndefined();
    expect(absoluteHttpsUrl(undefined, ORIGIN)).toBeUndefined();
  });
});

describe("reliable delivery", () => {
  async function seed() {
    await addSubscriber();
    await run(at(2 * MIN), []); // baseline (empty catalogue)
    await enqueueNewProducts([gem()], at(3 * MIN));
  }

  it("records the campaign id before sending", async () => {
    await seed();
    brevo.fail("sendCampaignNow", serverError());
    await run(at(4 * MIN));
    const [job] = await jobs();
    expect(job).toMatchObject({ status: "campaign_created", attempts: 1 });
    expect(Number(job.brevoCampaignId)).toBe(100);
  });

  it("retries a transient send failure with backoff and does not recreate the campaign", async () => {
    await seed();
    brevo.fail("sendCampaignNow", rateLimited(5 * MIN));
    await run(at(4 * MIN));
    const [job] = await jobs();
    expect(Date.parse(job.nextAttemptAt as string)).toBe(at(4 * MIN + 5 * MIN).getTime());

    expect((await run(at(5 * MIN))).jobs).toHaveLength(0); // not due yet
    expect((await run(at(10 * MIN))).jobs[0].outcome).toBe("sent");
    expect(brevo.campaigns.size).toBe(1);
    expect(brevo.calls.filter((c) => c === "createCampaign")).toHaveLength(1);
  });

  it("ambiguous send timeout: Brevo accepted it, so reconciliation marks sent and never resends", async () => {
    await seed();
    brevo.applyDespiteFault = true;
    brevo.fail("sendCampaignNow", timeout());
    await run(at(4 * MIN));
    expect((await jobs())[0].status).toBe("campaign_created");
    brevo.applyDespiteFault = false;
    brevo.calls.length = 0;
    await run(at(20 * MIN));
    expect((await jobs())[0]).toMatchObject({ status: "sent" });
    expect(brevo.calls).not.toContain("sendCampaignNow");
  });

  it("ambiguous create timeout: finds the existing campaign by name instead of creating a duplicate", async () => {
    await seed();
    brevo.applyDespiteFault = true;
    brevo.fail("createCampaign", timeout());
    await run(at(4 * MIN));
    expect((await jobs())[0].brevoCampaignId).toBeNull();
    expect(brevo.campaigns.size).toBe(1);
    brevo.applyDespiteFault = false;
    await run(at(20 * MIN));
    expect(brevo.campaigns.size).toBe(1);
    expect((await jobs())[0]).toMatchObject({ status: "sent", brevoCampaignId: 100 });
  });

  it("concurrent workers send the campaign once", async () => {
    await seed();
    await Promise.all([run(at(4 * MIN)), run(at(4 * MIN)), run(at(4 * MIN))]);
    expect(brevo.campaigns.size).toBe(1);
    expect(brevo.calls.filter((c) => c === "sendCampaignNow")).toHaveLength(1);
  });

  it("stops after bounded retries and records a terminal failure", async () => {
    await seed();
    brevo.faults.createCampaign = Array.from({ length: MAX_ATTEMPTS }, serverError);
    let t = 4 * MIN;
    for (let i = 0; i < MAX_ATTEMPTS + 2; i++) {
      await run(at(t));
      t += 7 * 60 * MIN;
    }
    expect((await jobs())[0]).toMatchObject({ status: "failed", attempts: MAX_ATTEMPTS });
    expect((await jobs())[0].lastError).toMatch(/503/);
  });

  it("fails immediately on a non-retryable error", async () => {
    await seed();
    brevo.fail("createCampaign", badRequest());
    await run(at(4 * MIN));
    expect((await jobs())[0]).toMatchObject({ status: "failed", attempts: 1 });
  });

  it("backoff grows and is capped", () => {
    expect(backoffMs(1)).toBe(MIN);
    expect(backoffMs(3)).toBe(4 * MIN);
    expect(backoffMs(30)).toBe(6 * 60 * MIN);
  });

  it("targets only the newsletter list and keeps transactional mail separate", async () => {
    await seed();
    await run(at(4 * MIN));
    const campaign = [...brevo.campaigns.values()][0];
    expect(campaign.listId).toBe(LIST_ID);
    expect(campaign.name).toBe("tapro-product-gem-1");
    expect(brevo.sent).toHaveLength(1); // only the confirmation email went through the transactional API
  });
});
