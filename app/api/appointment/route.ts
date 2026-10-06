import { NextResponse } from "next/server";
import { contactDetails } from "@/lib/data/contact";

const FIELDS = [
  ["fullName", "Full Name"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["format", "Appointment Format"],
  ["date", "Preferred Date"],
  ["time", "Preferred Time"],
  ["gemstone", "Gemstone of Interest"],
  ["message", "Message"],
] as const;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export async function POST(request: Request) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;

  if (!apiKey || !senderEmail) {
    console.error("Appointment email is not configured: set BREVO_API_KEY and BREVO_SENDER_EMAIL.");
    return NextResponse.json({ error: "Email service is not configured." }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: bots fill hidden fields; pretend success and send nothing.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const values = Object.fromEntries(
    FIELDS.map(([key]) => [key, typeof body[key] === "string" ? body[key].trim().slice(0, 2000) : ""]),
  );

  if (!values.fullName || !/^\S+@\S+\.\S+$/.test(values.email) || !values.date || !values.time) {
    return NextResponse.json({ error: "Please complete the required fields." }, { status: 400 });
  }

  const rows = FIELDS.map(
    ([key, label]) =>
      `<tr><td style="padding:6px 12px 6px 0;color:#5b6472;vertical-align:top"><strong>${label}</strong></td><td style="padding:6px 0">${
        escapeHtml(values[key] || "—").replace(/\n/g, "<br>")
      }</td></tr>`,
  ).join("");

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": apiKey, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: { name: "Tapro Gems Website", email: senderEmail },
      to: contactDetails.emails.map((email) => ({ email })),
      replyTo: { email: values.email, name: values.fullName },
      subject: `New appointment request — ${values.fullName}`,
      htmlContent: `<h2 style="font-family:Georgia,serif">New appointment request</h2><table style="font-family:Arial,sans-serif;font-size:14px">${rows}</table>`,
    }),
  });

  if (!response.ok) {
    console.error("Brevo error", response.status, await response.text());
    return NextResponse.json({ error: "Could not send your request." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
