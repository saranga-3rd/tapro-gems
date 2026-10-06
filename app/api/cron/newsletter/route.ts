import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { runWorkerNow } from "@/lib/newsletter/service";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(request: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  const header = request.headers.get("authorization") ?? "";
  const a = Buffer.from(header);
  const b = Buffer.from(`Bearer ${expected}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Scheduled processor (see vercel.json). Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. */
export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json({ ok: true, ...(await runWorkerNow()) });
  } catch (error) {
    console.error("Newsletter cron failed:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "Worker failed" }, { status: 500 });
  }
}
