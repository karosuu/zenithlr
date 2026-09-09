"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DeleteListingButton } from "./DeleteListingButton";
import type { Listing } from "@/lib/types";

type PropertyRow = Pick<Listing, "id" | "title" | "location" | "status" | "goals" | "price">;

export function PropertyList({ listings }: { listings: PropertyRow[] }) {
  const router = useRouter();
  const [items, setItems] = useState(listings);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const itemsRef = useRef(items);

  useEffect(() => {
    setItems(listings);
  }, [listings]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  function move(list: PropertyRow[], fromId: string, toId: string) {
    if (fromId === toId) return list;
    const from = list.findIndex((item) => item.id === fromId);
    const to = list.findIndex((item) => item.id === toId);
    if (from < 0 || to < 0) return list;
    const next = [...list];
    const [row] = next.splice(from, 1);
    next.splice(to, 0, row);
    return next;
  }

  async function persist(next: PropertyRow[]) {
    const currentIds = listings.map((item) => item.id).join(",");
    const nextIds = next.map((item) => item.id).join(",");
    if (currentIds === nextIds) return;

    setSaving(true);
    const res = await fetch("/api/listings/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((item) => item.id) }),
    });
    setSaving(false);
    if (!res.ok) {
      setItems(listings);
      alert("Could not save order");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <p className="mt-3 text-sm text-ink/50">
        Drag to set the default order on Sell, Rent, and the homepage.
        {saving ? " Saving…" : ""}
      </p>
      <div className="mt-8 divide-y divide-sand-soft border border-sand-soft bg-cream">
        {items.map((listing) => (
          <div
            key={listing.id}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              if (!draggingId || draggingId === listing.id || overId === listing.id) return;
              setOverId(listing.id);
              setItems((current) => move(current, draggingId, listing.id));
            }}
            onDrop={(e) => e.preventDefault()}
            className={`flex flex-wrap items-center justify-between gap-3 px-5 py-4 ${
              draggingId === listing.id ? "bg-sand-soft/70 opacity-60" : "hover:bg-sand-soft/40"
            }`}
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div
                draggable
                role="button"
                tabIndex={0}
                aria-label={`Reorder ${listing.title.en}`}
                className="shrink-0 cursor-grab px-1 py-2 text-ink/35 hover:text-ink active:cursor-grabbing"
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", listing.id);
                  setDraggingId(listing.id);
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
              <Link href={`/admin/properties/${listing.id}`} className="min-w-0 flex-1">
                <p className="font-medium">{listing.title.en}</p>
                <p className="text-sm text-ink/50">
                  {listing.location} · {listing.status} · {listing.goals.join(", ")}
                </p>
              </Link>
            </div>
            <div className="flex items-center gap-5">
              <p className="text-sm">${listing.price.toLocaleString()}</p>
              <DeleteListingButton id={listing.id} label={listing.title.en} />
            </div>
          </div>
        ))}
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
