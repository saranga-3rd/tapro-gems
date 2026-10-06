export type LegalBlock =
  | { type: "paragraph"; text: string; link?: { href: string; label: string } }
  | { type: "subheading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "fields"; items: { label: string; value: string }[] }
  | { type: "table"; headers: string[]; rows: string[][] };

export interface LegalSection {
  heading: string;
  blocks: LegalBlock[];
}

export interface LegalDocument {
  eyebrow: string;
  title: string;
  lastUpdated: string;
  intro: string[];
  sections: LegalSection[];
}
