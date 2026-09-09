import { readFile, stat } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  const filePath = path.join(process.cwd(), "public", "videos", "hero.mp4");
  try {
    const info = await stat(filePath);
    const data = await readFile(filePath);
    return new Response(data, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": String(info.size),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new Response("Video not found", { status: 404 });
  }
}
