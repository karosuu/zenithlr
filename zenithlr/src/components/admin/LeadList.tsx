"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Lead } from "@/lib/types";

const TYPE_LABEL: Record<Lead["type"], string> = {
  contact: "Contact",
  visit: "Visit",
  "sell-with-us": "Sell with us",
  newsletter: "Newsletter",
};

function formatWhen(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function LeadList({ leads }: { leads: Lead[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [clearOpen, setClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState("");

  async function removeOne(id: string) {
    setPendingId(id);
    setError("");
    const res = await fetch(`/api/leads/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    setPendingId(null);
    if (!res.ok) {
      setError("Could not delete this lead. Try again.");
      return;
    }
    setDeleteId(null);
    router.refresh();
  }

  async function removeAll() {
    setClearing(true);
    setError("");
    const res = await fetch("/api/leads", { method: "DELETE" });
    setClearing(false);
    if (!res.ok) {
      setError("Could not delete the leads. Try again.");
      return;
    }
    setClearOpen(false);
    router.refresh();
  }

  return (
    <div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink/50">
          {leads.length} {leads.length === 1 ? "lead" : "leads"} from the website forms.
        </p>
        <button
          type="button"
          className="text-[11px] tracking-[0.16em] uppercase text-red-800 hover:text-red-950"
          onClick={() => {
            setError("");
            setClearOpen(true);
          }}
        >
          Delete all
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-red-800">{error}</p>}

      <div className="mt-6 divide-y divide-sand-soft border border-sand-soft bg-cream">
        {leads.map((lead) => (
          <div
            key={lead.id}
            className="flex flex-wrap items-start justify-between gap-4 px-5 py-4"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium">{lead.name}</p>
              <p className="mt-1 text-sm text-ink/50">
                {TYPE_LABEL[lead.type]} · {lead.locale.toUpperCase()} · {formatWhen(lead.createdAt)}
              </p>
              <p className="mt-1 text-sm">
                <a href={`mailto:${lead.email}`} className="hover:text-sand-deep">
                  {lead.email}
                </a>
                {lead.phone ? ` · ${lead.phone}` : ""}
                {lead.listingSlug ? ` · ${lead.listingSlug}` : ""}
              </p>
              {lead.message ? (
                <p className="mt-2 whitespace-pre-wrap text-sm text-ink/70">{lead.message}</p>
              ) : null}
            </div>
            <button
              type="button"
              disabled={pendingId === lead.id}
              className="shrink-0 text-[11px] tracking-[0.16em] uppercase text-red-800 hover:text-red-950 disabled:opacity-40"
              onClick={() => {
                setError("");
                setDeleteId(lead.id);
              }}
            >
              {pendingId === lead.id ? "Deleting…" : "Delete"}
            </button>
          </div>
        ))}
      </div>

      {deleteId && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/50 px-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-lead-title"
        >
          <div className="w-full max-w-md border border-sand-soft bg-cream p-8 shadow-xl">
            <p className="text-[11px] tracking-[0.2em] uppercase text-sand-deep">Confirm</p>
            <h2 id="delete-lead-title" className="font-serif mt-2 text-3xl">
              Delete this lead?
            </h2>
            <p className="mt-4 leading-7 text-ink/70">
              You are about to delete{" "}
              <span className="font-medium text-ink">
                {leads.find((lead) => lead.id === deleteId)?.name ?? "this lead"}
              </span>
              . This cannot be undone.
            </p>
            <div className="mt-8 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                disabled={Boolean(pendingId)}
                className="px-5 py-3 text-[11px] tracking-[0.16em] uppercase text-ink/70 hover:text-ink"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={Boolean(pendingId)}
                className="bg-red-800 px-5 py-3 text-[11px] tracking-[0.16em] uppercase text-white hover:bg-red-900 disabled:opacity-40"
                onClick={() => void removeOne(deleteId)}
              >
                {pendingId === deleteId ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {clearOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/50 px-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-leads-title"
        >
          <div className="w-full max-w-md border border-sand-soft bg-cream p-8 shadow-xl">
            <p className="text-[11px] tracking-[0.2em] uppercase text-sand-deep">Confirm</p>
            <h2 id="clear-leads-title" className="font-serif mt-2 text-3xl">
              Delete all leads?
            </h2>
            <p className="mt-4 leading-7 text-ink/70">
              You are about to delete {leads.length}{" "}
              {leads.length === 1 ? "lead" : "leads"}. This cannot be undone.
            </p>
            <div className="mt-8 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                disabled={clearing}
                className="px-5 py-3 text-[11px] tracking-[0.16em] uppercase text-ink/70 hover:text-ink"
                onClick={() => setClearOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={clearing}
                className="bg-red-800 px-5 py-3 text-[11px] tracking-[0.16em] uppercase text-white hover:bg-red-900 disabled:opacity-40"
                onClick={() => void removeAll()}
              >
                {clearing ? "Deleting…" : "Yes, delete all"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
