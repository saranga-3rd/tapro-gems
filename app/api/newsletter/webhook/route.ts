import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { applyProviderEvent, type ProviderEvent } from "@/lib/newsletter/subscribers";

function authorized(request: Request) {
  const expected = process.env.BREVO_WEBHOOK_TOKEN;
  if (!expected) return false; // fail closed when not configured
  const header = request.headers.get("authorization") ?? "";
  const given = header.startsWith("Bearer ") ? header.slice(7) : "";
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Brevo marketing webhook (unsubscribe, spam, hard_bounce), authenticated with a bearer token. */
export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const events = (Array.isArray(body) ? body : [body]).slice(0, 100) as ProviderEvent[];
  try {
    for (const event of events) {
      if (event && typeof event === "object") await applyProviderEvent(event);
    }
  } catch (error) {
    console.error("Newsletter webhook failed:", error instanceof Error ? error.message : "unknown error");
    // 5xx makes Brevo retry; duplicate events are safe.
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
