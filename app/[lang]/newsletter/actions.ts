"use server";

import { redirect } from "next/navigation";
import { defaultLocale, hasLocale, localizePath } from "@/lib/i18n/config";
import { createBrevoClient } from "@/lib/newsletter/brevo";
import { confirmSubscription } from "@/lib/newsletter/subscribers";

/** Runs only when the visitor presses the button; merely opening the link never subscribes. */
export async function confirmNewsletterAction(form: FormData) {
  const token = String(form.get("token") ?? "");
  const rawLocale = String(form.get("locale") ?? "");
  const locale = hasLocale(rawLocale) ? rawLocale : defaultLocale;
  let status: string;
  try {
    status = await confirmSubscription(token, { brevo: createBrevoClient() });
  } catch (error) {
    console.error("Newsletter confirmation failed:", error instanceof Error ? error.message : "unknown error");
    status = "error";
  }
  redirect(localizePath(`/newsletter/result?status=${status}`, locale));
}
