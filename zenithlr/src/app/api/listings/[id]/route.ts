import { NextResponse } from "next/server";
import { getSessionEmail } from "@/lib/auth";
import { deleteListing, getListingById, saveListing } from "@/lib/store";
import type { Listing } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getSessionEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(listing);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getSessionEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const listing = (await request.json()) as Listing;
  listing.id = id;
  return NextResponse.json(await saveListing(listing));
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getSessionEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await deleteListing(id);
  return NextResponse.json({ ok: true });
}
