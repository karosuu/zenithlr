import { NextResponse } from "next/server";
import { getSessionEmail } from "@/lib/auth";
import {
  detectUploadExtension,
  isHeicBuffer,
  safeUploadFilename,
  saveUploadBuffer,
} from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isUploadBlob(value: FormDataEntryValue | null): value is Blob {
  return !!value && typeof value === "object" && typeof (value as Blob).arrayBuffer === "function";
}

export async function POST(request: Request) {
  if (!(await getSessionEmail())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!isUploadBlob(file)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const filename = "name" in file && typeof file.name === "string" ? file.name : "photo.jpg";
  const mime = "type" in file && typeof file.type === "string" ? file.type : "";
  const buffer = Buffer.from(await file.arrayBuffer());

  if (isHeicBuffer(buffer, mime, filename)) {
    return NextResponse.json(
      { error: "HEIC is not supported. Export the photo as JPG and try again." },
      { status: 400 },
    );
  }

  const ext = detectUploadExtension(buffer, mime, filename);
  const name = safeUploadFilename(
    `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext || "bin"}`,
  );
  if (!ext || !name) {
    return NextResponse.json(
      { error: "Use a JPG, PNG, or WebP photo." },
      { status: 400 },
    );
  }

  try {
    await saveUploadBuffer(name, buffer);
  } catch (error) {
    console.error("[zenith] upload write failed", error);
    return NextResponse.json({ error: "Could not save photo" }, { status: 500 });
  }

  return NextResponse.json({ url: `/uploads/${name}` });
}
