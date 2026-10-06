import { Building2, Mail, MapPin, Phone } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import RevealGroup from "@/components/motion/RevealGroup";
import { contactDetails } from "@/lib/data/contact";
import Section from "@/components/ui/Section";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function BusinessInformation() {
  const t = (await getDictionary()).contact.business;
  const details = [
    ...contactDetails.emails.map((email) => ({ icon: Mail, label: email })),
    { icon: Phone, label: `${contactDetails.phone} ${t.phoneSuffix}` },
    { icon: MapPin, label: contactDetails.address },
    { icon: Building2, label: t.registered },
  ];

  return (
    <Section background="white">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-8 text-center">
        <Reveal className="flex flex-col items-center gap-2">
          <h2 className="font-display text-2xl text-ink sm:text-3xl">Tapro Gems</h2>
          <p className="text-sm text-ink-muted">{t.tagline}</p>
          <p className="text-sm text-ink-muted">{t.specialising}</p>
        </Reveal>

        <RevealGroup as="ul" className="flex flex-col gap-3 text-sm text-ink-muted" stagger={0.06}>
          {details.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center justify-center gap-3">
              <Icon className="h-4 w-4 text-gold-600" aria-hidden="true" />
              {label}
            </li>
          ))}
        </RevealGroup>
      </div>
    </Section>
  );
}
