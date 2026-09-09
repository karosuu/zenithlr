import nodemailer from "nodemailer";
import type { Lead } from "./types";

function subjectFor(lead: Lead) {
  const es = lead.locale === "es";

  if (lead.type === "visit") {
    if (lead.listingSlug) {
      return es
        ? `Solicitud de visita: ${lead.listingSlug}`
        : `Visit request: ${lead.listingSlug}`;
    }
    return es ? "Solicitud de visita" : "Visit request";
  }

  if (lead.type === "sell-with-us") {
    return es ? "Vender con Zenith" : "Sell with Zenith";
  }

  if (lead.type === "newsletter") {
    return es ? "Suscripción al boletín" : "Newsletter signup";
  }

  return es ? `Nuevo contacto: ${lead.name}` : `New contact: ${lead.name}`;
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

function fromAddress(fallback: string) {
  const mailbox = process.env.SMTP_USER || fallback;
  const raw = (process.env.MAIL_FROM || mailbox).trim();
  if (raw.includes("@")) return raw;
  return `${raw} <${mailbox}>`;
}

export async function sendLeadEmail(lead: Lead) {
  const to =
    process.env.MANAGEMENT_EMAIL ||
    process.env.ADMIN_EMAIL ||
    "management@zenithlr.com";

  if (!isMailConfigured()) {
    if (process.env.NODE_ENV === "production") {
      console.error("[lead email skipped] SMTP_HOST / SMTP_USER / SMTP_PASS missing");
    } else {
      console.info("[lead email skipped — set SMTP_* in .env.local]\n", textFor(lead));
    }
    return;
  }

  const host = process.env.SMTP_HOST as string;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const local = host === "localhost" || host === "127.0.0.1";

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    ignoreTLS: !secure,
    requireTLS: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
      servername: local ? "mail.zenithlr.com" : host,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
  });

  await transporter.sendMail({
    from: fromAddress(to),
    to,
    replyTo: lead.email,
    subject: subjectFor(lead),
    text: textFor(lead),
  });
}
