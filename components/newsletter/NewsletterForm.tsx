"use client";

import Link from "@/components/i18n/LocaleLink";
import { useId, useRef, useState, type FormEvent } from "react";
import { useDictionary } from "@/components/i18n/LocaleProvider";
import { validateEmail } from "@/lib/newsletter/email";

type State =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "success"; message: string }
  | { phase: "error"; message: string };

export default function NewsletterForm() {
  const t = useDictionary().newsletter;
  const id = useId();
  const inFlight = useRef(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ phase: "idle" });
  const loading = state.phase === "loading";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return; // blocks double submits before React re-renders
    const check = validateEmail(email);
    if (!check.ok) {
      setState({ phase: "error", message: t.errors.invalid });
      return;
    }
    inFlight.current = true;
    setState({ phase: "loading" });
    try {
      const website = new FormData(event.currentTarget).get("website");
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: check.email, website }),
      });
      if (response.ok) {
        setState({ phase: "success", message: t.success });
        setEmail("");
      } else {
        // The API answers in English, so pick the localised message by status code.
        const message =
          response.status === 400
            ? t.errors.invalid
            : response.status === 429
              ? t.errors.tooMany
              : response.status === 502
                ? t.errors.sendFailed
                : response.status === 503
                  ? t.errors.unavailable
                  : t.errors.generic;
        setState({ phase: "error", message });
      }
    } catch {
      setState({ phase: "error", message: t.errors.network });
    } finally {
      inFlight.current = false;
    }
  }

  const hintId = `${id}-hint`;
  const statusId = `${id}-status`;

  return (
    <form onSubmit={onSubmit} noValidate className="flex w-full max-w-md flex-col gap-3" aria-busy={loading}>
      <label htmlFor={`${id}-email`} className="text-sm font-medium uppercase tracking-[0.2em] text-gold-600">
        {t.label}
      </label>
      <p id={hintId} className="text-sm leading-relaxed text-ink-muted">
        {t.hintBefore}
        <Link href="/privacy" className="underline underline-offset-4 hover:text-ink">
          {t.privacyLink}
        </Link>
        {t.hintAfter}
      </p>
      {/* Honeypot: hidden from people and assistive tech. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id={`${id}-email`}
          type="email"
          name="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          placeholder={t.placeholder}
          aria-describedby={`${hintId} ${statusId}`}
          aria-invalid={state.phase === "error"}
          className="h-12 min-w-0 flex-1 rounded-full border border-navy-900/15 bg-white px-5 text-sm text-ink placeholder:text-ink-muted/50 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 items-center justify-center rounded-full bg-gold-500 px-7 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-gold-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 disabled:opacity-60"
        >
          {loading ? t.subscribing : t.subscribe}
        </button>
      </div>
      <p
        id={statusId}
        role={state.phase === "error" ? "alert" : "status"}
        aria-live={state.phase === "error" ? "assertive" : "polite"}
        className={`min-h-5 text-sm ${state.phase === "error" ? "text-red-700" : "text-ink-muted"}`}
      >
        {state.phase === "loading" && t.sending}
        {(state.phase === "success" || state.phase === "error") && state.message}
      </p>
    </form>
  );
}
