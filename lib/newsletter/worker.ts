import { BrevoError, type BrevoClient } from "./brevo";
import { newsletterListId, siteUrl } from "./config";
import { enqueueNewProducts, establishBaseline, hasBaseline } from "./products";
import { mutate, readState, type JobRecord } from "./state";
import { retryPendingSyncs } from "./subscribers";
import { announcementEmail, type AnnouncedProduct } from "./templates";

type Job = JobRecord;

export const MAX_ATTEMPTS = 6;
const LOCK_MS = 5 * 60 * 1000;
const BASE_BACKOFF_MS = 60 * 1000;
const MAX_BACKOFF_MS = 6 * 60 * 60 * 1000;

export interface WorkerOptions {
  brevo: BrevoClient;
  /** Currently published products (CMS read). Omit to skip detection. */
  listProducts?: () => Promise<AnnouncedProduct[]>;
  now?: Date;
  origin?: string;
  maxJobs?: number;
}

export interface WorkerResult {
  baselined: number;
  enqueued: number;
  synced: number;
  jobs: { id: string; outcome: "sent" | "skipped" | "retry" | "failed" | "advanced" }[];
}

/** Already accepted by Brevo: the campaign is in flight or finished, never resend. */
const ACCEPTED = new Set(["queued", "in_process", "sent", "archive"]);

export function backoffMs(attempts: number, retryAfterMs?: number) {
  const exp = Math.min(BASE_BACKOFF_MS * 2 ** Math.max(0, attempts - 1), MAX_BACKOFF_MS);
  return Math.max(exp, Math.min(retryAfterMs ?? 0, MAX_BACKOFF_MS));
}

/**
 * One pass of the background processor. Safe to run concurrently and repeatedly: jobs are
 * claimed with row locks + a lease, and every Brevo step is preceded by a state check.
 */
export async function runNewsletterWorker(opts: WorkerOptions): Promise<WorkerResult> {
  const { brevo, now = new Date(), maxJobs = 5 } = opts;
  const result: WorkerResult = { baselined: 0, enqueued: 0, synced: 0, jobs: [] };

  if (opts.listProducts) {
    const products = await opts.listProducts();
    if (!(await hasBaseline())) {
      // First run after deployment: record the existing catalogue; announce nothing.
      await establishBaseline(products, now);
      result.baselined = products.length;
    } else {
      result.enqueued = (await enqueueNewProducts(products, now)).enqueued.length;
    }
  }

  result.synced = await retryPendingSyncs(brevo, now);

  const stamp = now.toISOString();
  // Claim due jobs under a lease so concurrent workers never process the same job.
  const claimed = await mutate((state) =>
    Object.values(state.jobs)
      .filter(
        (j) =>
          (j.status === "pending" || j.status === "campaign_created") &&
          Date.parse(j.nextAttemptAt) <= now.getTime() &&
          (!j.lockedUntil || Date.parse(j.lockedUntil) <= now.getTime()),
      )
      .sort((x, y) => x.nextAttemptAt.localeCompare(y.nextAttemptAt))
      .slice(0, maxJobs)
      .map((j) => {
        j.lockedUntil = new Date(now.getTime() + LOCK_MS).toISOString();
        j.updatedAt = stamp;
        return structuredClone(j);
      }),
  );

  for (const job of claimed) {
    result.jobs.push({ id: job.productId, outcome: await processJob(job, opts) });
  }
  return result;
}

async function processJob(job: Job, { brevo, now = new Date(), origin }: WorkerOptions) {
  const stamp = now.toISOString();
  const update = (patch: Partial<Job>) =>
    mutate((state) => {
      const j = state.jobs[job.productId];
      if (j) Object.assign(j, patch, { updatedAt: stamp });
    });
  const finish = (patch: Partial<Job>) => update({ ...patch, lockedUntil: null });

  try {
    let campaignId = job.brevoCampaignId;

    if (!campaignId) {
      const audience = await readState(
        (state) =>
          Object.values(state.subscribers).filter((s) => s.status === "active" && s.brevoSyncStatus === "synced")
            .length,
      );
      if (audience === 0) {
        await finish({ status: "skipped", lastError: "No confirmed subscribers at publication time." });
        return "skipped" as const;
      }
      // A previous attempt may have created the campaign and then timed out: look before creating.
      const existing = await brevo.findCampaignByName(job.campaignName);
      if (existing) {
        campaignId = existing.id;
      } else {
        const mail = announcementEmail(job.payload, origin ?? siteUrl());
        campaignId = await brevo.createCampaign({
          name: job.campaignName,
          subject: mail.subject,
          html: mail.html,
          listId: newsletterListId(),
        });
      }
      // Persist the campaign id BEFORE sending.
      await update({ brevoCampaignId: campaignId, status: "campaign_created" });
    }

    // Reconcile provider state before (re)sending; sendNow is never fired blindly.
    const campaign = await brevo.getCampaign(campaignId);
    if (!campaign) {
      await finish({ status: "failed", lastError: "Campaign no longer exists in Brevo." });
      return "failed" as const;
    }
    if (ACCEPTED.has(campaign.status)) {
      await finish({ status: "sent", acceptedAt: job.acceptedAt ?? stamp, lastError: null });
      return "sent" as const;
    }
    if (campaign.status !== "draft") {
      await finish({ status: "failed", lastError: `Unexpected Brevo campaign status: ${campaign.status}` });
      return "failed" as const;
    }
    await brevo.sendCampaignNow(campaignId);
    await finish({ status: "sent", acceptedAt: stamp, lastError: null });
    return "sent" as const;
  } catch (error) {
    const attempts = job.attempts + 1;
    const message = error instanceof Error ? error.message.slice(0, 300) : "Unknown error";
    const retryable = error instanceof BrevoError ? error.retryable : true;
    if (!retryable || attempts >= MAX_ATTEMPTS) {
      await finish({ status: "failed", attempts, lastError: message });
      return "failed" as const;
    }
    const retryAfter = error instanceof BrevoError ? error.retryAfterMs : undefined;
    await finish({
      attempts,
      nextAttemptAt: new Date(now.getTime() + backoffMs(attempts, retryAfter)).toISOString(),
      lastError: message,
    });
    return "retry" as const;
  }
}
