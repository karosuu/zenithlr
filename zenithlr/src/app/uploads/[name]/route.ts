import { readFile, stat } from "fs/promises";
import { resolveUploadFile, uploadMime } from "@/lib/uploads";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function serveUpload(name: string, includeBody: boolean) {
  const filePath = await resolveUploadFile(name);
  if (!filePath) {
    return new Response("Not found", {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const info = await stat(filePath);
  const headers = {
    "Content-Type": uploadMime(filePath),
    "Content-Length": String(info.size),
    "Cache-Control": "public, max-age=86400",
  };

  if (!includeBody) {
    return new Response(null, { status: 200, headers });
  }

  const data = await readFile(filePath);
  return new Response(data, { headers });
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ name: string }> },
) {
  const { name } = await context.params;
  return serveUpload(name, true);
}

export async function HEAD(
  _request: Request,
  context: { params: Promise<{ name: string }> },
) {
  const { name } = await context.params;
  return serveUpload(name, false);
}
