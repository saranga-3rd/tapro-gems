import type { LegalDocument } from "./types";

export const cookiePolicy: LegalDocument = {
  eyebrow: "Legal",
  title: "Cookie Policy",
  lastUpdated: "28 September 2026",
  intro: [
    "This Cookie Policy explains how Tapro Gems uses cookies and similar technologies on our website.",
  ],
  sections: [
    {
      heading: "1. What Are Cookies?",
      blocks: [
        {
          type: "paragraph",
          text: "Cookies are small files stored on your device when you visit a website.",
        },
        {
          type: "paragraph",
          text: "They can help websites function correctly, remember preferences and understand how visitors use the website.",
        },
      ],
    },
    {
      heading: "2. Cookies We May Use",
      blocks: [
        { type: "subheading", text: "Strictly Necessary Cookies" },
        {
          type: "paragraph",
          text: "These cookies are required for basic website functionality, security and user preferences.",
        },
        {
          type: "paragraph",
          text: "They may operate without separate consent where legally permitted.",
        },
        { type: "subheading", text: "Analytics Cookies" },
        {
          type: "paragraph",
          text: "These cookies help us understand how visitors interact with our website, such as which pages are visited and how the website is used.",
        },
        {
          type: "paragraph",
          text: "Analytics cookies will only be activated where required consent has been provided.",
        },
        { type: "subheading", text: "Functional Cookies" },
        {
          type: "paragraph",
          text: "These cookies may remember preferences such as language or other website settings.",
        },
        { type: "subheading", text: "Marketing Cookies" },
        {
          type: "paragraph",
          text: "If used, these cookies may help measure marketing campaigns or provide more relevant advertising. They will only be used after appropriate consent has been provided.",
        },
      ],
    },
    {
      heading: "3. Cookie Consent",
      blocks: [
        {
          type: "paragraph",
          text: "Where required, non-essential cookies will not be activated until you provide consent.",
        },
        {
          type: "paragraph",
          text: "You can accept, reject or manage your cookie preferences through our cookie settings.",
        },
        {
          type: "paragraph",
          text: "Cookie consent must be given through a genuine opt-in action, and withdrawing or changing your consent is just as easy as giving it.",
        },
      ],
    },
    {
      heading: "4. Changing Your Preferences",
      blocks: [
        {
          type: "paragraph",
          text: "You may change or withdraw your cookie preferences at any time by selecting Cookie Settings on our website.",
        },
        {
          type: "paragraph",
          text: "Your browser may also allow you to block or delete cookies.",
        },
        {
          type: "paragraph",
          text: "Please note that disabling necessary cookies may affect certain website functionality.",
        },
      ],
    },
    {
      heading: "5. Third-Party Services",
      blocks: [
        {
          type: "paragraph",
          text: "We may use third-party services that set cookies, such as:",
        },
        {
          type: "list",
          items: [
            "Website analytics",
            "Embedded videos",
            "Social media integrations",
            "Appointment services",
          ],
        },
        {
          type: "paragraph",
          text: "The exact services used on this website will be listed here once they are confirmed.",
        },
      ],
    },
    {
      heading: "6. Cookie List",
      blocks: [
        {
          type: "paragraph",
          text: "The table below will be completed with the specific cookies used on this website before launch.",
        },
        {
          type: "table",
          headers: ["Cookie", "Provider", "Purpose", "Type", "Duration"],
          rows: [
            ["[Cookie name]", "Tapro Gems", "Stores cookie preferences", "Necessary", "[Duration]"],
            ["[Cookie name]", "[Provider]", "Website analytics", "Analytics", "[Duration]"],
          ],
        },
      ],
    },
    {
      heading: "7. Contact",
      blocks: [
        { type: "paragraph", text: "If you have questions about our use of cookies, contact:" },
        {
          type: "fields",
          items: [
            { label: "Company", value: "Tapro Gems Oy" },
            { label: "Email", value: "hello@taprogems.com" },
          ],
        },
      ],
    },
  ],
};
