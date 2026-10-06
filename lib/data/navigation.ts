import type { Dictionary } from "@/messages/en";

export interface NavLink {
  label: string;
  href: string;
}

type NavKey = keyof Dictionary["nav"]["links"];
type FooterKey = keyof Dictionary["footer"]["links"];

const primaryNavItems: { key: NavKey; href: string }[] = [
  { key: "home", href: "/" },
  { key: "shop", href: "/shop" },
  { key: "collections", href: "/collections" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" },
];

const footerNavItems: {
  title: "explore" | "company" | "legal";
  links: { key: FooterKey; href: string }[];
}[] = [
  {
    title: "explore",
    links: [
      { key: "shop", href: "/shop" },
      { key: "collections", href: "/collections" },
      { key: "story", href: "/about" },
      { key: "certification", href: "/about#certification" },
      { key: "appointments", href: "/appointment" },
    ],
  },
  {
    title: "company",
    links: [
      { key: "home", href: "/" },
      { key: "shopShort", href: "/shop" },
      { key: "about", href: "/about" },
      { key: "contact", href: "/contact" },
    ],
  },
  {
    title: "legal",
    links: [
      { key: "privacy", href: "/privacy" },
      { key: "cookies", href: "/cookies" },
      { key: "terms", href: "/terms" },
      { key: "shipping", href: "/terms#shipping-and-delivery" },
    ],
  },
];

export const getPrimaryNav = (nav: Dictionary["nav"]): NavLink[] =>
  primaryNavItems.map(({ key, href }) => ({ label: nav.links[key], href }));

export const getFooterNav = (
  footer: Dictionary["footer"],
): { title: string; links: NavLink[] }[] =>
  footerNavItems.map(({ title, links }) => ({
    title: footer[title],
    links: links.map(({ key, href }) => ({ label: footer.links[key], href })),
  }));
