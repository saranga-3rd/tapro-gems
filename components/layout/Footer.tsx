import { Mail, MapPin, Phone } from "lucide-react";
import Link from "@/components/i18n/LocaleLink";
import NewsletterForm from "@/components/newsletter/NewsletterForm";
import Container from "@/components/ui/Container";
import SocialIcon from "@/components/ui/SocialIcon";
import { contactDetails } from "@/lib/data/contact";
import type { Dictionary } from "@/messages/en";
import { getFooterNav } from "@/lib/data/navigation";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import Logo from "./Logo";

const socials = [
  { platform: "whatsapp" as const, href: contactDetails.whatsapp, label: "WhatsApp" },
];

export default function Footer({ dictionary }: { dictionary: Dictionary["footer"] }) {
  const footerNav = getFooterNav(dictionary);
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ivory text-ink">
      <Container className="py-20">
        <div className="grid gap-16 lg:grid-cols-[1.3fr_2fr]">
          <div className="flex flex-col gap-6">
            <Logo className="h-auto w-full max-w-48" />
            <p className="max-w-sm text-sm leading-relaxed text-ink-muted">
              {dictionary.description}
            </p>
            <ul className="flex flex-col gap-3 text-sm text-ink-muted">
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gold-600" />
                hello@taprogems.com
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gold-600" />
                {contactDetails.phone}
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gold-600" />
                {contactDetails.address}
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {footerNav.map((column) => (
              <div key={column.title} className="flex flex-col gap-4">
                <span className="text-sm font-medium uppercase tracking-[0.2em] text-gold-600">
                  {column.title}
                </span>
                <ul className="flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-ink-muted transition-colors hover:text-ink"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 border-t border-navy-900/10 pt-10">
          <NewsletterForm />
        </div>

        <div className="mt-10 flex flex-col gap-6 border-t border-navy-900/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-muted/70">
            {dictionary.rights.replace("{year}", String(year))}
          </p>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              {socials.map((social) => (
                <a
                  key={social.platform}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="text-ink-muted transition-colors hover:text-gold-600"
                >
                  <SocialIcon platform={social.platform} />
                </a>
              ))}
            </div>

            <LanguageSwitcher className="border-l border-navy-900/10 pl-6" />
          </div>
        </div>
      </Container>
    </footer>
  );
}
