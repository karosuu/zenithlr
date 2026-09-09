import { NextResponse } from "next/server";
import { getSessionEmail } from "@/lib/auth";
import { deleteLead } from "@/lib/store";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getSessionEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await deleteLead(id);
  return NextResponse.json({ ok: true });
}
