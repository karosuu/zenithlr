import { NextResponse } from "next/server";
import { getSessionEmail } from "@/lib/auth";
import { sendLeadEmail } from "@/lib/mail";
import { addLead, clearLeads } from "@/lib/store";
import type { Lead } from "@/lib/types";

const LEAD_TYPES: Lead["type"][] = ["contact", "visit", "sell-with-us", "newsletter"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clip(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (clip(body.website, 200)) {
    return NextResponse.json({ ok: true });
  }

  const email = clip(body.email, 200).toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const type = LEAD_TYPES.includes(body.type as Lead["type"])
    ? (body.type as Lead["type"])
    : "contact";

  const lead = await addLead({
    type,
    name: clip(body.name, 120) || email,
    email,
    phone: clip(body.phone, 40) || undefined,
    message: clip(body.message, 4000) || undefined,
    listingSlug: clip(body.listingSlug, 120) || undefined,
    locale: body.locale === "es" ? "es" : "en",
  });

  try {
    await sendLeadEmail(lead);
  } catch (error) {
    console.error("Failed to email lead", error);
  }

  return NextResponse.json({ ok: true, id: lead.id });
}

export async function DELETE() {
  if (!(await getSessionEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await clearLeads();
  return NextResponse.json({ ok: true });
}
