/**
 * Thin Brevo REST client (https://developers.brevo.com). The API key is read from the
 * server environment only and is never logged or returned.
 */

const API = "https://api.brevo.com/v3";
const TIMEOUT_MS = 15_000;

export class BrevoError extends Error {
  constructor(
    message: string,
    readonly status: number | null,
    /** Safe to retry later (429, 5xx, network). */
    readonly retryable: boolean,
    /** The request may have been accepted even though we saw a failure (timeout/5xx/network). */
    readonly ambiguous: boolean,
    readonly retryAfterMs?: number,
  ) {
    super(message);
    this.name = "BrevoError";
  }
}

export type CampaignStatus = "draft" | "sent" | "archive" | "queued" | "suspended" | "in_process" | string;

export interface BrevoContact {
  id: number;
  emailBlacklisted: boolean;
  listIds: number[];
}

export interface BrevoClient {
  sendTransactional(input: { to: string; subject: string; html: string; text: string }): Promise<void>;
  getContact(email: string): Promise<BrevoContact | null>;
  upsertContact(email: string, listId: number): Promise<void>;
  createCampaign(input: { name: string; subject: string; html: string; listId: number }): Promise<number>;
  findCampaignByName(name: string): Promise<{ id: number; status: CampaignStatus } | null>;
  getCampaign(id: number): Promise<{ id: number; status: CampaignStatus } | null>;
  sendCampaignNow(id: number): Promise<void>;
}

function sender() {
  const email = process.env.BREVO_SENDER_EMAIL;
  if (!email) throw new Error("BREVO_SENDER_EMAIL is not configured.");
  return { name: process.env.BREVO_SENDER_NAME || "Tapro Gems", email };
}

export function createBrevoClient(apiKey = process.env.BREVO_API_KEY): BrevoClient {
  if (!apiKey) throw new Error("BREVO_API_KEY is not configured.");

  async function call(method: string, path: string, body?: unknown, allow404 = false) {
    let response: Response;
    try {
      response = await fetch(`${API}${path}`, {
        method,
        headers: { "api-key": apiKey as string, accept: "application/json", "content-type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(TIMEOUT_MS),
        cache: "no-store",
      });
    } catch {
      // Timeout or connection failure: for writes we cannot know whether Brevo processed it.
      throw new BrevoError("Brevo request failed or timed out.", null, true, method !== "GET");
    }
    if (response.ok) {
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    }
    if (response.status === 404 && allow404) return undefined;
    const retryAfter = Number(response.headers.get("retry-after"));
    const transient = response.status === 429 || response.status >= 500;
    // Only the status and Brevo's error code are kept; bodies could echo personal data.
    let code = "";
    try {
      code = String((await response.json())?.code ?? "");
    } catch {}
    throw new BrevoError(
      `Brevo ${method} ${path.split("?")[0]} failed: ${response.status}${code ? ` ${code}` : ""}`,
      response.status,
      transient,
      response.status >= 500,
      Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : undefined,
    );
  }

  return {
    async sendTransactional({ to, subject, html, text }) {
      await call("POST", "/smtp/email", {
        sender: sender(),
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text,
      });
    },

    async getContact(email) {
      const data = await call("GET", `/contacts/${encodeURIComponent(email)}?identifierType=email_id`, undefined, true);
      if (!data) return null;
      return {
        id: Number(data.id),
        emailBlacklisted: Boolean(data.emailBlacklisted),
        listIds: Array.isArray(data.listIds) ? data.listIds.map(Number) : [],
      };
    },

    async upsertContact(email, listId) {
      await call("POST", "/contacts", { email, listIds: [listId], updateEnabled: true });
    },

    async createCampaign({ name, subject, html, listId }) {
      const data = await call("POST", "/emailCampaigns", {
        name,
        subject,
        sender: sender(),
        htmlContent: html,
        recipients: { listIds: [listId] },
      });
      const id = Number(data?.id);
      if (!Number.isInteger(id)) throw new BrevoError("Brevo returned no campaign id.", null, true, true);
      return id;
    },

    async findCampaignByName(name) {
      for (let offset = 0; offset < 500; offset += 100) {
        const data = await call("GET", `/emailCampaigns?type=classic&limit=100&offset=${offset}&sort=desc`);
        const campaigns: { id: number; name: string; status: string }[] = data?.campaigns ?? [];
        const match = campaigns.find((c) => c.name === name);
        if (match) return { id: Number(match.id), status: match.status };
        if (campaigns.length < 100) break;
      }
      return null;
    },

    async getCampaign(id) {
      const data = await call("GET", `/emailCampaigns/${id}?statistics=globalStats`, undefined, true);
      return data ? { id: Number(data.id), status: String(data.status) } : null;
    },

    async sendCampaignNow(id) {
      await call("POST", `/emailCampaigns/${id}/sendNow`);
    },
  };
}
