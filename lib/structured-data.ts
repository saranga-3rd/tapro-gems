import { contactDetails } from "@/lib/data/contact";

const SITE_URL = "https://www.taprogems.fi";

/**
 * Organization + WebSite graph for the homepage. Only details that appear on the
 * site are included: email is omitted (the footer and contact page show different
 * addresses) and so are social profiles (no confirmed Facebook/Instagram URLs yet).
 */
export const homeStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Tapro Gems",
      url: SITE_URL,
      description:
        "Finland-based, family-owned gemstone house offering hand-selected, certified natural Sri Lankan sapphires, rubies and rare gemstones.",
      logo: `${SITE_URL}/logo.png`,
      telephone: contactDetails.phone,
      address: {
        "@type": "PostalAddress",
        streetAddress: "Hatanpäänkatu 15 B 26",
        addressLocality: "Tampere",
        addressCountry: "FI",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "Tapro Gems",
      alternateName: "TaproGems",
      url: SITE_URL,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};
