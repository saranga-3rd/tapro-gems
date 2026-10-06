"use client";

import { useState, type FormEvent } from "react";
import Reveal from "@/components/motion/Reveal";
import Button from "@/components/ui/Button";
import { useDictionary } from "@/components/i18n/LocaleProvider";
import Section from "@/components/ui/Section";
import type { GemstoneSummary } from "@/types/gemstone";
import { contactDetails } from "@/lib/data/contact";

// Stable English values are submitted; only the displayed labels are translated.
const formats = ["In person — Tampere", "Video call", "Phone call"];

const fieldClasses =
  "w-full rounded-xl border border-navy-900/15 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-muted/50 transition-colors focus:border-gold-500 focus:ring-1 focus:ring-gold-500 focus:outline-none";

const labelClasses = "text-xs font-medium tracking-[0.15em] text-ink-muted uppercase";

export default function AppointmentForm({ gemstones }: { gemstones: GemstoneSummary[] }) {
  const t = useDictionary().appointmentForm;
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSending(true);
    setError("");

    const data = Object.fromEntries(new FormData(event.currentTarget).entries());

    try {
      const response = await fetch("/api/appointment", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Request failed");
      setSubmitted(true);
    } catch {
      setError(t.error.replace("{phone}", contactDetails.phone));
    } finally {
      setSending(false);
    }
  };

  return (
    <Section background="ivory" className="pt-32 md:pt-40 lg:pt-48">
      <div className="mx-auto flex max-w-3xl flex-col gap-10">
        <Reveal className="flex flex-col items-center gap-4 text-center">
          <span className="text-sm font-medium tracking-[0.3em] text-gold-600 uppercase">
            {t.eyebrow}
          </span>
          <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">
            {t.heading}
          </h1>
          <p className="max-w-lg text-base leading-relaxed text-ink-muted sm:text-lg">
            {t.intro}
          </p>
          <p className="text-sm text-ink-muted">
            {contactDetails.address} · {contactDetails.phone}
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          {submitted ? (
            <p className="rounded-2xl border border-gold-300 bg-white p-8 text-center text-base text-ink">
              {t.success}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-6 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className={labelClasses}>{t.fullName}</span>
                <input type="text" name="fullName" required className={fieldClasses} />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClasses}>{t.email}</span>
                <input type="email" name="email" required className={fieldClasses} />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClasses}>{t.phone}</span>
                <input type="tel" name="phone" className={fieldClasses} />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClasses}>{t.format}</span>
                <select name="format" required defaultValue="" className={fieldClasses}>
                  <option value="" disabled>
                    {t.selectOption}
                  </option>
                  {formats.map((format, index) => (
                    <option key={format} value={format}>
                      {t.formats[index]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClasses}>{t.date}</span>
                <input type="date" name="date" required className={fieldClasses} />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClasses}>{t.time}</span>
                <input type="time" name="time" required className={fieldClasses} />
              </label>

              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className={labelClasses}>{t.gemstone}</span>
                <select name="gemstone" defaultValue="" className={fieldClasses}>
                  <option value="">{t.noGemstone}</option>
                  {gemstones.map((gemstone) => (
                    <option key={gemstone.id} value={gemstone.name}>
                      {gemstone.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className={labelClasses}>{t.message}</span>
                <textarea name="message" rows={4} className={`${fieldClasses} resize-none`} />
              </label>

              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
              />

              <div className="flex flex-col gap-3 sm:col-span-2">
                {error ? (
                  <p role="alert" className="text-sm text-red-700">
                    {error}
                  </p>
                ) : null}
                <div>
                  <Button type="submit" size="md" disabled={sending}>
                    {sending ? t.sending : t.submit}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </Reveal>
      </div>
    </Section>
  );
}
