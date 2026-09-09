import { promises as fs } from "fs";
import path from "path";

const UPLOAD_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

export function uploadsDir() {
  return path.join(process.cwd(), "public", "uploads");
}

export function safeUploadFilename(name: string): string | null {
  const base = path.basename(name);
  if (!base || base !== name || base.includes("\0") || base.includes("..")) return null;
  if (!/^[A-Za-z0-9._-]+$/.test(base)) return null;
  if (!UPLOAD_EXTS.has(path.extname(base).toLowerCase())) return null;
  return base;
}

export function uploadMime(name: string) {
  return MIME[path.extname(name).toLowerCase()] || "application/octet-stream";
}

export async function resolveUploadFile(name: string): Promise<string | null> {
  const safe = safeUploadFilename(name);
  if (!safe) return null;

  const candidates = [
    path.join(uploadsDir(), safe),
    path.join(process.cwd(), "data", "uploads", safe),
  ];
  for (const file of candidates) {
    try {
      const info = await fs.stat(file);
      if (info.isFile()) return file;
    } catch {
      /* try next location */
    }
  }
  return null;
}
