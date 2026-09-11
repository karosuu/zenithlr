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

export function uploadWriteDirs() {
  return [
    path.join(process.cwd(), "public", "uploads"),
    path.join(process.cwd(), "data", "uploads"),
  ];
}

export function isHeicBuffer(buffer: Buffer, mime = "", filename = "") {
  if (/heic|heif/i.test(mime) || /\.hei[cf]$/i.test(filename)) return true;
  if (buffer.length >= 12 && buffer.toString("ascii", 4, 8) === "ftyp") {
    const brand = buffer.toString("ascii", 8, 12).toLowerCase();
    return ["heic", "heif", "mif1", "msf1", "heix", "hevc"].includes(brand);
  }
  return false;
}

export function detectUploadExtension(buffer: Buffer, mime = "", filename = "") {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpg";
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "png";
  }
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }
  if (buffer.length >= 12 && buffer.toString("ascii", 4, 8) === "ftyp") {
    const brand = buffer.toString("ascii", 8, 12).toLowerCase();
    if (brand.startsWith("avif") || brand === "avis") return "avif";
  }

  const fromMime: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
  };
  if (fromMime[mime]) return fromMime[mime];

  const ext = path.extname(filename).toLowerCase();
  if (ext === ".jpeg") return "jpg";
  if (UPLOAD_EXTS.has(ext)) return ext.slice(1);
  return null;
}

export async function saveUploadBuffer(name: string, buffer: Buffer) {
  let lastError: unknown;
  for (const dir of uploadWriteDirs()) {
    try {
      await fs.mkdir(dir, { recursive: true });
      const filePath = path.join(dir, name);
      await fs.writeFile(filePath, buffer);
      return filePath;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Could not save upload");
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
