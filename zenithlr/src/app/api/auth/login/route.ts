import { NextResponse } from "next/server";
import { createSession, getAdminCredentials } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = getAdminCredentials();
  if (body.email !== email || body.password !== password) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  await createSession(body.email);
  return NextResponse.json({ ok: true });
}
