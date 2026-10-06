import type { LegalDocument } from "./types";

// TODO before launch: confirm the legal company name, Finnish Business ID,
// registered address and data retention periods with the client.
const companyFields = [
  { label: "Company Name", value: "Tapro Gems Oy" },
  { label: "Business ID", value: "[Business ID]" },
  { label: "Registered Address", value: "[Registered Address], Helsinki, Finland" },
  { label: "Email", value: "hello@taprogems.com" },
  { label: "Phone", value: "+358 40 000 0000" },
];

export const privacyPolicy: LegalDocument = {
  eyebrow: "Legal",
  title: "Privacy Policy",
  lastUpdated: "28 September 2026",
  intro: [
    "Tapro Gems respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store and protect personal data when you visit our website or contact us.",
  ],
  sections: [
    {
      heading: "1. Who We Are",
      blocks: [
        {
          type: "paragraph",
          text: "Tapro Gems is a Finland-based gemstone business specialising in natural Sri Lankan gemstones.",
        },
        { type: "fields", items: companyFields },
        {
          type: "paragraph",
          text: "For privacy-related questions or requests, please contact us using the details above.",
        },
      ],
    },
    {
      heading: "2. Information We May Collect",
      blocks: [
        {
          type: "paragraph",
          text: "We may collect information that you provide directly to us, including:",
        },
        {
          type: "list",
          items: [
            "Name",
            "Email address",
            "Phone number",
            "Country",
            "Appointment details",
            "Gemstone interests",
            "Enquiry messages",
            "Preferred contact method",
            "Business information for wholesale enquiries",
          ],
        },
        {
          type: "paragraph",
          text: "We may also collect limited technical information when you use our website, such as:",
        },
        {
          type: "list",
          items: [
            "IP address",
            "Browser type",
            "Device type",
            "Website usage information",
            "Cookie preferences",
          ],
        },
      ],
    },
    {
      heading: "3. How We Use Your Information",
      blocks: [
        { type: "paragraph", text: "We may use your information to:" },
        {
          type: "list",
          items: [
            "Respond to enquiries",
            "Arrange private appointments",
            "Provide gemstone information",
            "Process sourcing or wholesale requests",
            "Provide customer support",
            "Improve our website and services",
            "Maintain website security",
            "Comply with legal obligations",
          ],
        },
        {
          type: "paragraph",
          text: "Where required, we process personal information based on your consent, our legitimate business interests, contractual requirements, or legal obligations.",
        },
      ],
    },
    {
      heading: "4. Marketing Communications",
      blocks: [
        {
          type: "paragraph",
          text: "We will only send promotional or marketing communications where permitted by law.",
        },
        {
          type: "paragraph",
          text: "You may unsubscribe from marketing communications at any time by using the unsubscribe option provided or by contacting us.",
        },
      ],
    },
    {
      heading: "5. Sharing Personal Information",
      blocks: [
        { type: "paragraph", text: "We do not sell your personal information." },
        {
          type: "paragraph",
          text: "We may share information with trusted service providers where necessary to operate our business, for example:",
        },
        {
          type: "list",
          items: [
            "Website hosting providers",
            "Email providers",
            "Analytics providers",
            "Appointment or form services",
            "IT and security providers",
          ],
        },
        {
          type: "paragraph",
          text: "These providers may only process information as necessary to provide their services.",
        },
      ],
    },
    {
      heading: "6. International Data Transfers",
      blocks: [
        {
          type: "paragraph",
          text: "Some service providers may process information outside Finland or the European Economic Area.",
        },
        {
          type: "paragraph",
          text: "Where required, we use appropriate safeguards to protect personal information in accordance with applicable data protection laws.",
        },
      ],
    },
    {
      heading: "7. Data Retention",
      blocks: [
        {
          type: "paragraph",
          text: "We retain personal information only for as long as necessary for the purpose for which it was collected, or where required by law.",
        },
        {
          type: "paragraph",
          text: "Different types of information may be kept for different periods.",
        },
      ],
    },
    {
      heading: "8. Your Rights",
      blocks: [
        {
          type: "paragraph",
          text: "Depending on applicable law, you may have the right to:",
        },
        {
          type: "list",
          items: [
            "Access your personal information",
            "Request correction of inaccurate information",
            "Request deletion of information",
            "Request restriction of processing",
            "Object to certain processing",
            "Request data portability",
            "Withdraw consent where processing is based on consent",
          ],
        },
        {
          type: "paragraph",
          text: "Withdrawing consent does not affect the lawfulness of processing carried out before the withdrawal. Some processing is based on legal obligations rather than consent, and withdrawing consent does not affect that processing.",
        },
      ],
    },
    {
      heading: "9. Cookies",
      blocks: [
        {
          type: "paragraph",
          text: "We use cookies and similar technologies to operate and improve our website. For more information, please read our",
          link: { href: "/cookies", label: "Cookie Policy" },
        },
      ],
    },
    {
      heading: "10. Security",
      blocks: [
        {
          type: "paragraph",
          text: "We take reasonable technical and organisational measures to protect personal information against unauthorised access, loss, misuse or disclosure.",
        },
      ],
    },
    {
      heading: "11. Changes to This Policy",
      blocks: [
        { type: "paragraph", text: "We may update this Privacy Policy from time to time." },
        {
          type: "paragraph",
          text: "The latest version will always be available on this website.",
        },
      ],
    },
    {
      heading: "12. Contact Us",
      blocks: [
        { type: "paragraph", text: "For privacy questions or requests, contact:" },
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
