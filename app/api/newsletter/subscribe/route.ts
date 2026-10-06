import { NextResponse } from "next/server";
import { createBrevoClient } from "@/lib/newsletter/brevo";
import { validateEmail } from "@/lib/newsletter/email";
import { allowRequest, hashForBucket } from "@/lib/newsletter/rate-limit";
import { requestSubscription } from "@/lib/newsletter/subscribers";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_IP = 5;
const MAX_PER_EMAIL = 3;

export async function POST(request: Request) {
  // Same-origin only: blocks cross-site form posts.
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.headers.get("host")) {
    return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: bots fill hidden fields. Pretend success and do nothing.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const check = validateEmail(typeof body.email === "string" ? body.email : "");
  if (!check.ok) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const [ipOk, emailOk] = [
      await allowRequest(`ip:${hashForBucket(ip)}`, MAX_PER_IP, WINDOW_MS),
      await allowRequest(`email:${hashForBucket(check.normalized)}`, MAX_PER_EMAIL, WINDOW_MS),
    ];
    if (!ipOk || !emailOk) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again in a few minutes." },
        { status: 429, headers: { "retry-after": "600" } },
      );
    }

    const outcome = await requestSubscription(check.email, { brevo: createBrevoClient() });
    if (!outcome.ok) {
      return NextResponse.json(
        { error: "We could not send the confirmation email. Please try again shortly." },
        { status: 502 },
      );
    }
    // Same response whether or not an email was sent, so the form cannot be used to
    // discover who is already subscribed.
    return NextResponse.json({ ok: true, message: "Please check your inbox to confirm your subscription." });
  } catch (error) {
    console.error("Newsletter subscribe failed:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "Subscriptions are temporarily unavailable." }, { status: 503 });
  }
}
