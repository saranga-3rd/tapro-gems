import { Briefcase, CalendarCheck, Mail, MessageCircle } from "lucide-react";
import Link from "@/components/i18n/LocaleLink";
import RevealGroup from "@/components/motion/RevealGroup";
import { contactDetails } from "@/lib/data/contact";
import Section from "@/components/ui/Section";
import { getDictionary } from "@/lib/i18n/dictionary";

const options = [
  {
    icon: Mail,
    href: `mailto:${contactDetails.emails.join(",")}`,
  },
  {
    icon: MessageCircle,
    href: contactDetails.whatsapp,
  },
  {
    icon: CalendarCheck,
    href: "/appointment",
  },
  {
    icon: Briefcase,
    href: "/#collectors",
  },
];

export default async function ContactOptions() {
  const items = (await getDictionary()).contact.options.items;
  return (
    <Section background="white">
      <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
        {options.map(({ icon: Icon, href }, index) => {
          const { title, description } = items[index];
          return (
          <Link
            key={title}
            href={href}
            className="group flex flex-col gap-4 rounded-2xl border border-navy-900/10 p-8 transition-colors duration-300 hover:border-gold-300"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sapphire-900/5 text-sapphire-700">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-display text-lg text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{description}</p>
            </div>
          </Link>
          );
        })}
      </RevealGroup>
    </Section>
  );
}
