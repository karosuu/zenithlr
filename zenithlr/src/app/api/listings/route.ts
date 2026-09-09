import { NextResponse } from "next/server";
import { getSessionEmail } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { getAllListings, saveListing } from "@/lib/store";
import type { Listing } from "@/lib/types";

export async function GET() {
  if (!(await getSessionEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getAllListings());
}

export async function POST(request: Request) {
  if (!(await getSessionEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const listing = (await request.json()) as Listing;
  if (!listing.id) listing.id = crypto.randomUUID();
  listing.slug =
    slugify(listing.slug) ||
    slugify(listing.title?.en || listing.title?.es || "") ||
    listing.id;
  const saved = await saveListing(listing);
  return NextResponse.json(saved);
}
