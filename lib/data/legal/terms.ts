import type { LegalDocument } from "./types";

// TODO before launch: confirm the legal company name, Finnish Business ID and
// registered address with the client, and revisit section 8/9 once online
// payments are enabled.
const companyFields = [
  { label: "Company Name", value: "Tapro Gems Oy" },
  { label: "Business ID", value: "[Business ID]" },
  { label: "Registered Address", value: "[Registered Address], Helsinki, Finland" },
  { label: "Email", value: "hello@taprogems.com" },
];

export const termsAndConditions: LegalDocument = {
  eyebrow: "Legal",
  title: "Terms & Conditions",
  lastUpdated: "28 September 2026",
  intro: [
    "These Terms & Conditions govern your use of the Tapro Gems website and any enquiries, appointments or services arranged through it.",
    "By using this website, you agree to these terms.",
  ],
  sections: [
    {
      heading: "1. About Tapro Gems",
      blocks: [
        {
          type: "paragraph",
          text: "Tapro Gems is a Finland-based business specialising in natural Sri Lankan gemstones.",
        },
        { type: "fields", items: companyFields },
      ],
    },
    {
      heading: "2. Website Information",
      blocks: [
        {
          type: "paragraph",
          text: "We aim to provide accurate information about our gemstones and services. However, gemstone appearance may vary slightly depending on:",
        },
        {
          type: "list",
          items: ["Lighting", "Photography", "Video", "Display settings", "Natural characteristics of the stone"],
        },
        {
          type: "paragraph",
          text: "Images and videos are intended to represent gemstones as accurately as reasonably possible.",
        },
      ],
    },
    {
      heading: "3. Natural Gemstones",
      blocks: [
        {
          type: "paragraph",
          text: "Our gemstone listings may include information such as:",
        },
        {
          type: "list",
          items: ["Carat weight", "Cut", "Colour", "Origin", "Treatment status", "Certification"],
        },
        {
          type: "paragraph",
          text: "Natural gemstones may contain inclusions, colour variations and other naturally occurring characteristics.",
        },
        {
          type: "paragraph",
          text: "These characteristics are part of the individuality of each gemstone.",
        },
      ],
    },
    {
      heading: "4. Certification",
      blocks: [
        {
          type: "paragraph",
          text: "Gemstones may be supplied with local Sri Lankan certification or recognised gemstone authority certification.",
        },
        {
          type: "paragraph",
          text: "International certification may be arranged where available and agreed with the customer.",
        },
        {
          type: "paragraph",
          text: "The details of the certificate supplied with a gemstone will be confirmed before purchase.",
        },
      ],
    },
    {
      heading: "5. Prices",
      blocks: [
        {
          type: "paragraph",
          text: "Where prices are not displayed publicly, customers may contact Tapro Gems to request further information.",
        },
        {
          type: "paragraph",
          text: "A price or quotation provided directly to a customer may be subject to:",
        },
        {
          type: "list",
          items: ["Availability", "Certification requirements", "Delivery arrangements", "Applicable taxes", "Other agreed services"],
        },
      ],
    },
    {
      heading: "6. Appointments and Enquiries",
      blocks: [
        {
          type: "paragraph",
          text: "Submitting an enquiry or booking request does not automatically create a sales contract.",
        },
        {
          type: "paragraph",
          text: "Appointments remain subject to confirmation by Tapro Gems.",
        },
      ],
    },
    {
      heading: "7. Product Availability",
      blocks: [
        { type: "paragraph", text: "Many gemstones are unique individual items." },
        { type: "paragraph", text: "Availability may change without notice." },
        {
          type: "paragraph",
          text: "Submitting an enquiry does not reserve a gemstone unless Tapro Gems confirms the reservation separately.",
        },
      ],
    },
    {
      heading: "8. Purchases",
      blocks: [
        {
          type: "paragraph",
          text: "If Tapro Gems later enables purchases through the website, customers will receive the required product, pricing, payment, delivery and cancellation information before entering into a binding purchase.",
        },
      ],
    },
    {
      heading: "9. Returns and Withdrawal Rights",
      blocks: [
        {
          type: "paragraph",
          text: "Where statutory consumer withdrawal rights apply, Tapro Gems will honour those rights in accordance with applicable Finnish and EU consumer law.",
        },
        {
          type: "paragraph",
          text: "In most cases, consumers have a 14-day right of withdrawal from online purchases, subject to certain legal exceptions, such as goods made or personalised to the customer's specifications. Any lawful exceptions to the right of withdrawal will be clearly communicated before a purchase is completed.",
        },
        {
          type: "paragraph",
          text: "Customers may be responsible for any reduction in value caused by handling of the goods beyond what is necessary to establish their nature, characteristics and function.",
        },
        {
          type: "paragraph",
          text: "For wholesale or other business-to-business transactions, separate agreed terms may apply.",
        },
      ],
    },
    {
      heading: "10. Shipping and Delivery",
      blocks: [
        {
          type: "paragraph",
          text: "Where delivery is arranged, the following will be confirmed before purchase:",
        },
        {
          type: "list",
          items: ["Destination", "Shipping method", "Insurance", "Estimated delivery time", "Shipping cost", "Applicable customs or import obligations"],
        },
        {
          type: "paragraph",
          text: "Tapro Gems is not responsible for delays outside its reasonable control.",
        },
      ],
    },
    {
      heading: "11. Wholesale and Professional Buyers",
      blocks: [
        { type: "paragraph", text: "Separate commercial terms may apply to:" },
        {
          type: "list",
          items: ["Wholesale buyers", "Jewellery designers", "Dealers", "Other business customers"],
        },
        { type: "paragraph", text: "These terms may be agreed individually." },
      ],
    },
    {
      heading: "12. Intellectual Property",
      blocks: [
        {
          type: "paragraph",
          text: "All website content, including branding, text, graphics, photography and design, belongs to Tapro Gems or is used with permission.",
        },
        {
          type: "paragraph",
          text: "Content may not be copied, reproduced or used commercially without permission.",
        },
      ],
    },
    {
      heading: "13. External Links",
      blocks: [
        { type: "paragraph", text: "Our website may contain links to third-party websites." },
        {
          type: "paragraph",
          text: "Tapro Gems is not responsible for third-party content, privacy practices or services.",
        },
      ],
    },
    {
      heading: "14. Limitation of Liability",
      blocks: [
        {
          type: "paragraph",
          text: "Nothing in these Terms excludes or limits rights or liabilities that cannot legally be excluded.",
        },
        {
          type: "paragraph",
          text: "To the extent permitted by applicable law, Tapro Gems is not responsible for indirect losses arising solely from the use or inability to use this website.",
        },
      ],
    },
    {
      heading: "15. Changes to These Terms",
      blocks: [
        { type: "paragraph", text: "We may update these Terms from time to time." },
        { type: "paragraph", text: "The latest version will be available on this website." },
      ],
    },
    {
      heading: "16. Governing Law",
      blocks: [
        {
          type: "paragraph",
          text: "These Terms are governed by applicable Finnish law, subject to any mandatory consumer protections that apply to customers in their country of residence.",
        },
      ],
    },
    {
      heading: "17. Contact",
      blocks: [
        { type: "paragraph", text: "Questions regarding these Terms can be sent to:" },
        {
          type: "fields",
          items: [
            { label: "Company", value: "Tapro Gems Oy" },
            { label: "Email", value: "hello@taprogems.com" },
            { label: "Address", value: "[Registered Address], Helsinki, Finland" },
          ],
        },
      ],
    },
  ],
};
