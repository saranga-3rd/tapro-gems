export const CONSENT_VERSION = "2026-10-v1";
export const CONSENT_TEXT =
  "I agree to receive emails from Tapro Gems announcing new gemstones and jewellery. I can unsubscribe at any time.";
export const CONSENT_SOURCE_FOOTER = "website-footer";

export const CONFIRMATION_TTL_MS = 48 * 60 * 60 * 1000;
export const RESEND_COOLDOWN_MS = 2 * 60 * 1000;

/** Canonical public origin used in every emailed link. Set SITE_URL in production. */
export function siteUrl(): string {
  const raw =
    process.env.SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "");
  if (!raw) throw new Error("SITE_URL is not configured.");
  const url = new URL(raw);
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
    throw new Error("SITE_URL must be an https URL in production.");
  }
  return url.origin;
}

export function newsletterListId(): number {
  const id = Number(process.env.BREVO_NEWSLETTER_LIST_ID);
  if (!Number.isInteger(id) || id <= 0) throw new Error("BREVO_NEWSLETTER_LIST_ID is not configured.");
  return id;
}
