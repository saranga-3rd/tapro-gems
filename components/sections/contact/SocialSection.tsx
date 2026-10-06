import Reveal from "@/components/motion/Reveal";
import Section from "@/components/ui/Section";
import SocialIcon from "@/components/ui/SocialIcon";
import { contactDetails } from "@/lib/data/contact";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function SocialSection() {
  const t = (await getDictionary()).contact.social;
  const socials = [
    { platform: "whatsapp" as const, href: contactDetails.whatsapp, label: t.whatsappLabel },
  ];

  return (
    <Section background="ivory">
      <Reveal className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
        <h2 className="font-display text-3xl leading-tight text-ink sm:text-4xl">
          {t.heading}
        </h2>
        <p className="text-base leading-relaxed text-ink-muted sm:text-lg">
          {t.text}
        </p>
        <div className="flex items-center gap-4">
          {socials.map((social) => (
            <a
              key={social.platform}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="flex h-14 w-14 items-center justify-center rounded-full border border-navy-900/15 text-ink-muted transition-colors hover:border-gold-400 hover:text-gold-600"
            >
              <SocialIcon platform={social.platform} className="h-6 w-6" />
            </a>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}
