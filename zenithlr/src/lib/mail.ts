import nodemailer from "nodemailer";
import type { Lead } from "./types";

function subjectFor(lead: Lead) {
  if (lead.type === "visit") {
    return lead.listingSlug ? `Visit request: ${lead.listingSlug}` : "Visit request";
  }
  if (lead.type === "sell-with-us") return "Sell with Zenith";
  if (lead.type === "newsletter") return "Newsletter signup";
  return "Website inquiry";
}

function textFor(lead: Lead) {
  return [
    `Type: ${lead.type}`,
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    lead.phone ? `Phone: ${lead.phone}` : "",
    lead.listingSlug ? `Property: ${lead.listingSlug}` : "",
    `Locale: ${lead.locale}`,
    lead.message ? `Message:\n${lead.message}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function isMailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function sendLeadEmail(lead: Lead) {
  const to =
    process.env.MANAGEMENT_EMAIL ||
    process.env.ADMIN_EMAIL ||
    "management@zenithlr.com";

  if (!isMailConfigured()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMTP is not configured");
    }
    console.info("[lead email skipped — set SMTP_* in .env.local]\n", textFor(lead));
    return;
  }

  const port = Number(process.env.SMTP_PORT || 587);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER || to,
    to,
    replyTo: lead.email,
    subject: subjectFor(lead),
    text: textFor(lead),
  });
}
