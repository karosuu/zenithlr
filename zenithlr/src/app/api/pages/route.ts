import { NextResponse } from "next/server";
import { getSessionEmail } from "@/lib/auth";
import { getDb, savePage } from "@/lib/store";

export async function GET() {
  const db = await getDb();
  return NextResponse.json(db.pages);
}

export async function PUT(request: Request) {
  if (!(await getSessionEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const saved = await savePage(body.key, body.fields);
  return NextResponse.json(saved);
}
