"use client";

export async function uploadFile(file: File) {
  const data = new FormData();
  data.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: data });
  if (!res.ok) throw new Error("Upload failed");
  const json = (await res.json()) as { url: string };
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
  return (
    <label className="block cursor-pointer border border-dashed border-sand-deep bg-sand-soft/40 px-4 py-6 text-center text-sm text-ink/70">
      {label}
      <input
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={async (e) => {
          const files = [...(e.target.files ?? [])];
          const urls: string[] = [];
          for (const file of files) {
            urls.push(await uploadFile(file));
          }
          if (urls.length) onUploaded(urls);
          e.target.value = "";
        }}
      />
    </label>
  );
}
