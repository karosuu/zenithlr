import { NextResponse } from "next/server";
import { getSessionEmail } from "@/lib/auth";
import { reorderReviews } from "@/lib/store";

export async function PUT(request: Request) {
  if (!(await getSessionEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { ids?: unknown };
  if (!Array.isArray(body.ids) || body.ids.some((id) => typeof id !== "string")) {
    return NextResponse.json({ error: "Invalid order" }, { status: 400 });
  }

  const reviews = await reorderReviews(body.ids);
  return NextResponse.json(reviews);
}
