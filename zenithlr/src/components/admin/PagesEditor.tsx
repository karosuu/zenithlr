"use client";

import { useState } from "react";
import { BilingualField } from "./BilingualField";
import type { Localized, PageFields } from "@/lib/types";

function isLocalized(value: Localized | string): value is Localized {
  return typeof value === "object" && value !== null && "en" in value;
}

export function PagesEditor({ pages }: { pages: Record<string, PageFields> }) {
  const keys = Object.keys(pages);
  const [active, setActive] = useState(keys[0] ?? "home");
  const [draft, setDraft] = useState(pages);
  const [status, setStatus] = useState("");

  const fields = draft[active] ?? {};

  return (
    <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
      <div className="flex flex-col gap-2">
        {keys.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setActive(key)}
            className={`px-3 py-2 text-left text-sm capitalize ${
              active === key ? "bg-ink text-sand" : "hover:bg-sand-soft"
            }`}
          >
            {key}
          </button>
        ))}
      </div>
      <form
        className="space-y-6"
        onSubmit={async (e) => {
          e.preventDefault();
          setStatus("Saving…");
          const res = await fetch("/api/pages", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: active, fields: draft[active] }),
          });
          setStatus(res.ok ? "Saved" : "Could not save");
        }}
      >
        {Object.entries(fields).map(([field, value]) =>
          isLocalized(value) ? (
            <BilingualField
              key={field}
              label={field}
              value={value}
              multiline={value.en.length > 80 || value.es.length > 80}
              onChange={(next) =>
                setDraft((prev) => ({
                  ...prev,
                  [active]: { ...prev[active], [field]: next },
                }))
              }
            />
          ) : null,
        )}
        <button
          type="submit"
          className="bg-ink px-6 py-3 text-[11px] tracking-[0.18em] uppercase text-sand"
        >
          Save page
        </button>
        {status && <p className="text-sm text-sand-deep">{status}</p>}
      </form>
    </div>
  );
}
