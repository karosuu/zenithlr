import { NextResponse } from "next/server";
import { getSessionEmail } from "@/lib/auth";
import { getAllReviews, saveReview } from "@/lib/store";
import type { Review } from "@/lib/types";

export async function GET() {
  if (!(await getSessionEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getAllReviews());
}

export async function POST(request: Request) {
  if (!(await getSessionEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const review = (await request.json()) as Review;
  if (!review.id) review.id = crypto.randomUUID();
  if (!review.date) review.date = new Date().toISOString().slice(0, 10);
  return NextResponse.json(await saveReview(review));
}
