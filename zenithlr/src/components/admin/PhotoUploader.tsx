"use client";

import { useState } from "react";
import { prepareUploadImage } from "@/lib/prepare-upload-image";

export async function uploadFile(file: File) {
  const data = new FormData();
  data.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: data });
  if (!res.ok) {
    let message = res.status === 413 ? "Photo is too large for the server" : "Upload failed";
    try {
      const json = (await res.json()) as { error?: string };
      if (json?.error) message = json.error;
    } catch {
      /* nginx/OpenResty 413 pages are not JSON */
    }
    throw new Error(message);
  }
  const json = (await res.json()) as { url: string };
  if (!json.url) throw new Error("Upload failed");
  return json.url;
}

export function PhotoUploader({
  label,
  onUploaded,
  multiple,
}: {
  label: string;
  onUploaded: (urls: string[]) => void;
  multiple?: boolean;
}) {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleFiles = async (list: FileList | File[] | null) => {
    const files = [...(list ?? [])].filter((file) => file.size > 0);
    if (!files.length || busy) return;

    setBusy(true);
    setError("");
    const urls: string[] = [];
    const failures: string[] = [];

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      setStatus(`Uploading ${index + 1}/${files.length}…`);
      try {
        const prepared = await prepareUploadImage(file);
        urls.push(await uploadFile(prepared));
      } catch (err) {
        failures.push(err instanceof Error ? err.message : `${file.name}: upload failed`);
      }
    }

    if (urls.length) onUploaded(urls);
    setStatus(urls.length ? `Uploaded ${urls.length} photo${urls.length === 1 ? "" : "s"}` : "");
    setError(failures.join(" · "));
    setBusy(false);
  };

  return (
    <div>
      <label
        className="block cursor-pointer border border-dashed border-sand-deep bg-sand-soft/40 px-4 py-6 text-center text-sm text-ink/70"
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
        }}
        onDrop={async (e) => {
          e.preventDefault();
          await handleFiles(e.dataTransfer.files);
        }}
      >
        {busy ? status || "Uploading…" : label}
        <span className="mt-1 block text-xs text-ink/45">
          Click or drop JPG, PNG, or WebP. iPhone HEIC is converted when the browser allows it.
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif,image/*"
          multiple={multiple}
          disabled={busy}
          className="sr-only"
          onChange={async (e) => {
            await handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>
      {status && !error && <p className="mt-2 text-xs text-sand-deep">{status}</p>}
      {error && <p className="mt-2 text-xs text-red-800">{error}</p>}
    </div>
  );
}
