import { readFile, readdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function loadCss(): Promise<Buffer | null> {
  const candidates = [
    path.join(process.cwd(), "public", "zenith.css"),
    path.join(process.cwd(), ".next", "static", "css"),
  ];

  try {
    return await readFile(candidates[0]);
  } catch {
    /* try build css dir */
  }

  try {
    const dir = candidates[1];
    const names = await readdir(dir);
    const css = names.find((name) => name.endsWith(".css"));
    if (css) return await readFile(path.join(dir, css));
  } catch {
    /* missing */
  }

  return null;
}

export async function GET() {
  const css = await loadCss();
  if (!css) {
    return new Response("/* zenith css missing */", {
      status: 404,
      headers: {
        "Content-Type": "text/css; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  return new Response(css, {
    headers: {
      "Content-Type": "text/css; charset=utf-8",
      "Cache-Control": "public, max-age=60",
    },
  });
}
