import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getSessionEmail } from "@/lib/auth";

export async function POST(request: Request) {
  if (!(await getSessionEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, name), buffer);

  return NextResponse.json({ url: `/uploads/${name}` });
}
