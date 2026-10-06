import { contactDetails } from "@/lib/data/contact";

export interface AnnouncedProduct {
  id: string;
  type: "gemstone" | "jewellery";
  /** Path on the public site, e.g. /shop/blue-sapphire. */
  path: string;
  name: string;
  /** Human label such as "Sapphire" or "Jewellery". */
  typeLabel: string;
  description: string;
  /** Raw image reference from the product data (absolute https URL or site path). */
  image?: string;
  /** Only facts that exist in the product data, in display order. */
  details: { label: string; value: string }[];
}

export const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/** Returns an absolute https URL for an image, or undefined if none can be produced. */
export function absoluteHttpsUrl(src: string | undefined, origin: string): string | undefined {
  if (!src) return undefined;
  try {
    const url = new URL(src, `${origin}/`);
    return url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

const NAVY = "#0b1526";
const GOLD = "#a67d3b";
const IVORY = "#faf8f4";

function shell(title: string, inner: string, footer: string) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:${IVORY};font-family:Arial,Helvetica,sans-serif;color:#12161f">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${IVORY}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #ece5d8">
<tr><td style="background:${NAVY};padding:22px 32px;text-align:center"><span style="font-family:Georgia,serif;font-size:22px;letter-spacing:4px;color:#e0c583">TAPRO GEMS</span></td></tr>
<tr><td style="padding:32px">${inner}</td></tr>
<tr><td style="padding:20px 32px;background:${IVORY};font-size:12px;line-height:1.6;color:#5b6472;text-align:center">${footer}</td></tr>
</table></td></tr></table></body></html>`;
}

export function confirmationEmail(confirmUrl: string) {
  const url = escapeHtml(confirmUrl);
  const html = shell(
    "Confirm your Tapro Gems subscription",
    `<h1 style="font-family:Georgia,serif;font-size:26px;margin:0 0 16px;color:${NAVY}">Confirm your subscription</h1>
<p style="font-size:15px;line-height:1.7;margin:0 0 24px">Thank you for your interest in Tapro Gems. Please confirm your email address to receive announcements when we publish new gemstones and jewellery.</p>
<p style="margin:0 0 24px"><a href="${url}" style="display:inline-block;background:${GOLD};color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 28px;border-radius:999px;font-size:14px">Confirm subscription</a></p>
<p style="font-size:13px;line-height:1.6;color:#5b6472;margin:0">If the button does not work, copy this link into your browser:<br><a href="${url}" style="color:${GOLD};word-break:break-all">${url}</a></p>`,
    "This link expires in 48 hours. If you did not request this, you can safely ignore this email and you will not be subscribed.",
  );
  const text = `Confirm your Tapro Gems subscription\n\nPlease confirm your email address to receive announcements of new gemstones and jewellery:\n${confirmUrl}\n\nThis link expires in 48 hours. If you did not request this, ignore this email and you will not be subscribed.`;
  return { subject: "Confirm your Tapro Gems subscription", html, text };
}

/** Campaign HTML. `{{ unsubscribe }}` is Brevo's merge tag for the per-recipient unsubscribe link. */
export function announcementEmail(product: AnnouncedProduct, origin: string) {
  const link = escapeHtml(new URL(product.path, `${origin}/`).toString());
  const image = absoluteHttpsUrl(product.image, origin);
  const heading = "New to the Tapro Gems collection";
  const details = product.details
    .filter((d) => d.value.trim())
    .map(
      (d) =>
        `<tr><td style="padding:4px 16px 4px 0;color:#5b6472;font-size:13px">${escapeHtml(d.label)}</td><td style="padding:4px 0;font-size:13px">${escapeHtml(d.value)}</td></tr>`,
    )
    .join("");
  const inner = `<p style="margin:0 0 8px;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:${GOLD}">${escapeHtml(product.typeLabel)}</p>
<h1 style="font-family:Georgia,serif;font-size:28px;line-height:1.25;margin:0 0 20px;color:${NAVY}">${escapeHtml(heading)}: ${escapeHtml(product.name)}</h1>
${image ? `<a href="${link}"><img src="${escapeHtml(image)}" alt="${escapeHtml(product.name)}" width="536" style="display:block;width:100%;max-width:536px;height:auto;border:0;margin:0 0 20px"></a>` : ""}
${product.description.trim() ? `<p style="font-size:15px;line-height:1.7;margin:0 0 20px">${escapeHtml(product.description.trim().slice(0, 400))}</p>` : ""}
${details ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px">${details}</table>` : ""}
<p style="margin:0"><a href="${link}" style="display:inline-block;background:${GOLD};color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 28px;border-radius:999px;font-size:14px">View ${escapeHtml(product.name)}</a></p>`;
  const footer = `You are receiving this because you subscribed to Tapro Gems announcements.<br>Tapro Gems Oy, ${escapeHtml(contactDetails.address)}, Finland<br><a href="{{ unsubscribe }}" style="color:${GOLD}">Unsubscribe</a>`;
  return {
    subject: `New at Tapro Gems: ${product.name}`,
    html: shell(`${heading}: ${product.name}`, inner, footer),
  };
}
