"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteListingButton({
  id,
  label,
  redirectTo,
}: {
  id: string;
  label: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    setPending(true);
    setError("");
    const res = await fetch(`/api/listings/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setPending(false);
      setError("Could not delete this property. Try again.");
      return;
    }
    setOpen(false);
    if (redirectTo) {
      router.push(redirectTo);
    }
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        disabled={pending}
        className="text-[11px] tracking-[0.16em] uppercase text-red-800 hover:text-red-950 disabled:opacity-40"
        onClick={() => {
          setError("");
          setOpen(true);
        }}
      >
        {pending ? "Deleting…" : "Delete"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/50 px-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`delete-title-${id}`}
        >
          <div className="w-full max-w-md border border-sand-soft bg-cream p-8 shadow-xl">
            <p className="text-[11px] tracking-[0.2em] uppercase text-sand-deep">
              Confirm
            </p>
            <h2 id={`delete-title-${id}`} className="font-serif mt-2 text-3xl">
              Delete this property?
            </h2>
            <p className="mt-4 leading-7 text-ink/70">
              You are about to delete <span className="font-medium text-ink">{label}</span>.
              This cannot be undone.
            </p>
            {error && <p className="mt-3 text-sm text-red-800">{error}</p>}
            <div className="mt-8 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                disabled={pending}
                className="px-5 py-3 text-[11px] tracking-[0.16em] uppercase text-ink/70 hover:text-ink"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={pending}
                className="bg-red-800 px-5 py-3 text-[11px] tracking-[0.16em] uppercase text-white hover:bg-red-900 disabled:opacity-40"
                onClick={remove}
              >
                {pending ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
