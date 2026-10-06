"use client";

import { useState, type FormEvent } from "react";
import Reveal from "@/components/motion/Reveal";
import Button from "@/components/ui/Button";
import { useDictionary } from "@/components/i18n/LocaleProvider";
import Section from "@/components/ui/Section";

// Stable English values are submitted; only the displayed labels are translated.
const enquiryTypes = [
  "General Enquiry",
  "Book an Appointment",
  "Gemstone Availability",
  "Private Sourcing",
  "Wholesale Enquiry",
  "Certification Question",
  "Other",
];

const contactMethods = ["Email", "Phone", "WhatsApp"];

const fieldClasses =
  "w-full rounded-xl border border-navy-900/15 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-muted/50 transition-colors focus:border-gold-500 focus:ring-1 focus:ring-gold-500 focus:outline-none";

const labelClasses = "text-xs font-medium tracking-[0.15em] text-ink-muted uppercase";

export default function ContactForm() {
  const t = useDictionary().contactForm;
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <Section id="enquiry-form" background="ivory" className="scroll-mt-24">
      <div className="mx-auto flex max-w-3xl flex-col gap-10">
        <Reveal className="flex flex-col items-center gap-4 text-center">
          <h2 className="font-display text-3xl leading-tight text-ink sm:text-4xl">
            {t.heading}
          </h2>
          <p className="max-w-lg text-base leading-relaxed text-ink-muted sm:text-lg">
            {t.intro}
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
                <span className={labelClasses}>{t.country}</span>
                <input type="text" name="country" className={fieldClasses} />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClasses}>{t.enquiryType}</span>
                <select name="enquiryType" required defaultValue="" className={fieldClasses}>
                  <option value="" disabled>
                    {t.selectOption}
                  </option>
                  {enquiryTypes.map((type, index) => (
                    <option key={type} value={type}>
                      {t.enquiryTypes[index]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClasses}>{t.contactMethod}</span>
                <select name="contactMethod" defaultValue="" className={fieldClasses}>
                  <option value="" disabled>
                    {t.selectOption}
                  </option>
                  {contactMethods.map((method, index) => (
                    <option key={method} value={method}>
                      {t.contactMethods[index]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className={labelClasses}>{t.gemstone}</span>
                <input
                  type="text"
                  name="gemstone"
                  placeholder={t.gemstonePlaceholder}
                  className={fieldClasses}
                />
              </label>

              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className={labelClasses}>{t.message}</span>
                <textarea
                  name="message"
                  rows={5}
                  required
                  className={`${fieldClasses} resize-none`}
                />
              </label>

              <div className="sm:col-span-2">
                <Button type="submit" size="md">
                  {t.submit}
                </Button>
              </div>
            </form>
          )}
        </Reveal>
      </div>
    </Section>
  );
}
