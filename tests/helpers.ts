import { BrevoError, type BrevoClient, type BrevoContact } from "@/lib/newsletter/brevo";
import { memoryStorage, readState, setStorageForTests } from "@/lib/newsletter/state";

export const LIST_ID = 7;
export const ORIGIN = "https://taprogems.test";

export async function useTestDb() {
  setStorageForTests(memoryStorage());
}

export const subscriberRow = (email = "a@example.com") => readState((st) => st.subscribers[email]);
export const allJobs = () => readState((st) => Object.values(st.jobs));
export const subscriberCount = () => readState((st) => Object.keys(st.subscribers).length);

type Fault = BrevoError | undefined;

/** In-memory Brevo. Faults are consumed one per call, per method. */
export class FakeBrevo implements BrevoClient {
  sent: { to: string; subject: string; html: string; text: string }[] = [];
  contacts = new Map<string, BrevoContact>();
  campaigns = new Map<number, { id: number; name: string; status: string; html: string; subject: string; listId: number }>();
  calls: string[] = [];
  faults: Record<string, Fault[]> = {};
  /** When true the faulted call still takes effect (ambiguous timeout). */
  applyDespiteFault = false;
  private nextCampaign = 100;

  fail(method: string, ...errors: BrevoError[]) {
    this.faults[method] = errors;
  }
  private async enter(method: string, effect?: () => void) {
    this.calls.push(method);
    const fault = this.faults[method]?.shift();
    if (fault) {
      if (this.applyDespiteFault) effect?.();
      throw fault;
    }
    effect?.();
  }

  async sendTransactional(input: { to: string; subject: string; html: string; text: string }) {
    await this.enter("sendTransactional", () => this.sent.push(input));
  }
  async getContact(email: string) {
    await this.enter("getContact");
    return this.contacts.get(email) ?? null;
  }
  async upsertContact(email: string, listId: number) {
    await this.enter("upsertContact", () => {
      const existing = this.contacts.get(email);
      this.contacts.set(email, {
        id: existing?.id ?? this.contacts.size + 1,
        emailBlacklisted: existing?.emailBlacklisted ?? false,
        listIds: [...new Set([...(existing?.listIds ?? []), listId])],
      });
    });
  }
  async createCampaign(input: { name: string; subject: string; html: string; listId: number }) {
    let id = 0;
    await this.enter("createCampaign", () => {
      id = this.nextCampaign++;
      this.campaigns.set(id, { id, status: "draft", ...input });
    });
    return id;
  }
  async findCampaignByName(name: string) {
    await this.enter("findCampaignByName");
    return [...this.campaigns.values()].find((c) => c.name === name) ?? null;
  }
  async getCampaign(id: number) {
    await this.enter("getCampaign");
    return this.campaigns.get(id) ?? null;
  }
  async sendCampaignNow(id: number) {
    await this.enter("sendCampaignNow", () => {
      this.campaigns.get(id)!.status = "queued";
    });
  }
}

export const timeout = () => new BrevoError("timeout", null, true, true);
export const rateLimited = (ms?: number) => new BrevoError("429", 429, true, false, ms);
export const badRequest = () => new BrevoError("400", 400, false, false);
export const serverError = () => new BrevoError("503", 503, true, true);

export function tokenFrom(brevo: FakeBrevo, index = -1): string {
  const mail = brevo.sent.at(index)!;
  return new URL(/href="([^"]+)"/.exec(mail.html)![1].replace(/&amp;/g, "&")).searchParams.get("token")!;
}
