"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BilingualField } from "./BilingualField";
import type { Review } from "@/lib/types";

export function emptyReview(): Review {
  return {
    id: "new",
    author: "",
    quote: { en: "", es: "" },
    date: new Date().toISOString().slice(0, 10),
    featured: true,
    published: true,
    sortOrder: 0,
  };
}

export function ReviewForm({ initial, isNew }: { initial?: Review; isNew?: boolean }) {
  const router = useRouter();
  const [review, setReview] = useState(initial ?? emptyReview());
  const [status, setStatus] = useState("");

  return (
    <form
      className="space-y-6"
      onSubmit={async (e) => {
        e.preventDefault();
        const payload = {
          ...review,
          id: review.id === "new" ? crypto.randomUUID() : review.id,
        };
        setStatus("Saving…");
        const res = await fetch(isNew ? "/api/reviews" : `/api/reviews/${review.id}`, {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          setStatus("Could not save");
          return;
        }
        router.push("/admin/reviews");
        router.refresh();
      }}
    >
      <label className="text-xs tracking-[0.14em] uppercase text-sand-deep">
        Author
        <input
          className="admin-input mt-2"
          required
          value={review.author}
          onChange={(e) => setReview({ ...review, author: e.target.value })}
        />
      </label>
      <BilingualField
        label="Quote"
        multiline
        value={review.quote}
        onChange={(quote) => setReview({ ...review, quote })}
      />
      <label className="text-xs tracking-[0.14em] uppercase text-sand-deep">
        Date
        <input
          type="date"
          className="admin-input mt-2"
          value={review.date}
          onChange={(e) => setReview({ ...review, date: e.target.value })}
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={review.published}
          onChange={(e) => setReview({ ...review, published: e.target.checked })}
        />
        Published
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={review.featured}
            onChange={(e) => setReview({ ...review, featured: e.target.checked })}
          />
          Show on homepage
        </span>
        <span className="pl-6 text-xs text-ink/50">
          Up to 4 published homepage reviews appear on the home page, in the list order.
        </span>
      </label>
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="bg-ink px-6 py-3 text-[11px] tracking-[0.18em] uppercase text-sand"
        >
          Save review
        </button>
        {!isNew && (
          <button
            type="button"
            className="px-6 py-3 text-[11px] tracking-[0.18em] uppercase text-red-800"
            onClick={async () => {
              if (!confirm("Delete this review?")) return;
              const res = await fetch(`/api/reviews/${review.id}`, { method: "DELETE" });
              if (!res.ok) {
                setStatus("Could not delete");
                return;
              }
              router.push("/admin/reviews");
              router.refresh();
            }}
          >
            Delete
          </button>
        )}
        {status && <p className="self-center text-sm text-sand-deep">{status}</p>}
      </div>
    </form>
  );
}
