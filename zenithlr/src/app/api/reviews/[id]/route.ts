import { NextResponse } from "next/server";
import { getSessionEmail } from "@/lib/auth";
import { deleteReview, getReviewById, saveReview } from "@/lib/store";
import type { Review } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getSessionEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const review = await getReviewById(id);
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(review);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getSessionEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const review = (await request.json()) as Review;
  review.id = id;
  return NextResponse.json(await saveReview(review));
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getSessionEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await deleteReview(id);
  return NextResponse.json({ ok: true });
}
