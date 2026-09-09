"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { homepageReviewLabel } from "@/lib/review-display";
import type { Review } from "@/lib/types";

type ReviewRow = Pick<Review, "id" | "author" | "date" | "published" | "featured">;

export function ReviewList({ reviews }: { reviews: ReviewRow[] }) {
  const router = useRouter();
  const [items, setItems] = useState(reviews);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const itemsRef = useRef(items);

  useEffect(() => {
    setItems(reviews);
  }, [reviews]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  function move(list: ReviewRow[], fromId: string, toId: string) {
    if (fromId === toId) return list;
    const from = list.findIndex((item) => item.id === fromId);
    const to = list.findIndex((item) => item.id === toId);
    if (from < 0 || to < 0) return list;
    const next = [...list];
    const [row] = next.splice(from, 1);
    next.splice(to, 0, row);
    return next;
  }

  async function persist(next: ReviewRow[]) {
    const currentIds = reviews.map((item) => item.id).join(",");
    const nextIds = next.map((item) => item.id).join(",");
    if (currentIds === nextIds) return;

    setSaving(true);
    const res = await fetch("/api/reviews/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((item) => item.id) }),
    });
    setSaving(false);
    if (!res.ok) {
      setItems(reviews);
      alert("Could not save order");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <p className="mt-3 text-sm text-ink/50">
        Drag to set the order. The first 4 published reviews marked Show on homepage appear on the
        home page.
        {saving ? " Saving…" : ""}
      </p>
      <div className="mt-8 divide-y divide-sand-soft border border-sand-soft bg-cream">
        {items.map((review) => {
          const homepage = homepageReviewLabel(items, review.id);
          return (
            <div
              key={review.id}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (!draggingId || draggingId === review.id || overId === review.id) return;
                setOverId(review.id);
                setItems((current) => move(current, draggingId, review.id));
              }}
              onDrop={(e) => e.preventDefault()}
              className={`flex flex-wrap items-center justify-between gap-3 px-5 py-4 ${
                draggingId === review.id ? "bg-sand-soft/70 opacity-60" : "hover:bg-sand-soft/40"
              }`}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div
                  draggable
                  role="button"
                  tabIndex={0}
                  aria-label={`Reorder ${review.author}`}
                  className="shrink-0 cursor-grab px-1 py-2 text-ink/35 hover:text-ink active:cursor-grabbing"
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", review.id);
                    setDraggingId(review.id);
                    setOverId(null);
                  }}
                  onDragEnd={() => {
                    setDraggingId(null);
                    setOverId(null);
                    void persist(itemsRef.current);
                  }}
                >
                  <DragHandleIcon />
                </div>
                <Link href={`/admin/reviews/${review.id}`} className="min-w-0 flex-1">
                  <p className="font-medium">{review.author}</p>
                  <p className="text-sm text-ink/50">
                    {review.date} · {review.published ? "Published" : "Draft"}
                    {homepage ? ` · ${homepage}` : ""}
                  </p>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DragHandleIcon() {
  return (
    <svg width="14" height="18" viewBox="0 0 14 18" fill="currentColor" aria-hidden>
      <circle cx="4" cy="3" r="1.4" />
      <circle cx="10" cy="3" r="1.4" />
      <circle cx="4" cy="9" r="1.4" />
      <circle cx="10" cy="9" r="1.4" />
      <circle cx="4" cy="15" r="1.4" />
      <circle cx="10" cy="15" r="1.4" />
    </svg>
  );
}
