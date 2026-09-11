"use client";

const MAX_EDGE = 1920;
const MAX_BYTES = 850_000;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

function isAllowedOriginal(file: File) {
  if (ALLOWED.has(file.type)) return true;
  return /\.(jpe?g|png|webp|avif)$/i.test(file.name);
}

function isHeicLike(file: File) {
  return /heic|heif/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
}

function loadHtmlImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("decode failed"));
    image.src = url;
  });
}

async function decodeImage(file: File) {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      /* Safari/Chrome fallback below */
    }
  }

  const url = URL.createObjectURL(file);
  try {
    return await loadHtmlImage(url);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("encode failed"))),
      "image/jpeg",
      quality,
    );
  });
}

async function rasterizeToJpeg(file: File) {
  const source = await decodeImage(file);
  const srcW =
    "naturalWidth" in source && source.naturalWidth ? source.naturalWidth : source.width;
  const srcH =
    "naturalHeight" in source && source.naturalHeight ? source.naturalHeight : source.height;
  if (!srcW || !srcH) throw new Error("decode failed");

  const scale = Math.min(1, MAX_EDGE / Math.max(srcW, srcH));
  const width = Math.max(1, Math.round(srcW * scale));
  const height = Math.max(1, Math.round(srcH * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("encode failed");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(source, 0, 0, width, height);
  if (typeof ImageBitmap !== "undefined" && source instanceof ImageBitmap) {
    source.close();
  }

  let blob: Blob | null = null;
  for (const quality of [0.82, 0.72, 0.6, 0.48]) {
    blob = await canvasToBlob(canvas, quality);
    if (blob.size <= MAX_BYTES) break;
  }
  if (!blob) throw new Error("encode failed");

  const name = `${file.name.replace(/\.[^.]+$/, "") || "photo"}.jpg`.replace(
    /[^\w.\-]+/g,
    "-",
  );
  return new File([blob], name, { type: "image/jpeg" });
}

export async function prepareUploadImage(file: File): Promise<File> {
  try {
    const prepared = await rasterizeToJpeg(file);
    if (isAllowedOriginal(file) && file.size <= MAX_BYTES && file.size <= prepared.size) {
      return file;
    }
    return prepared;
  } catch {
    if (isHeicLike(file)) {
      throw new Error(`${file.name}: convert HEIC to JPG and try again`);
    }
    if (isAllowedOriginal(file) && file.size <= MAX_BYTES) {
      return file;
    }
    throw new Error(`${file.name}: could not read this image`);
  }
}
