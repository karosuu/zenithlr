"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import type { Lead } from "@/lib/types";

type Status = "idle" | "sending" | "ok" | "error";

export function LeadForm({
  type,
  listingSlug,
  locale,
}: {
  type: Lead["type"];
  listingSlug?: string;
  locale: string;
}) {
  const t = useTranslations("forms");
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus("sending");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          listingSlug,
          locale,
          name: data.name,
          email: data.email,
          phone: data.phone,
          message: data.message,
          website: data.website,
        }),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("ok");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  const busy = status === "sending";

  if (type === "newsletter") {
    return (
      <form className="relative flex flex-col gap-3" onSubmit={onSubmit}>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Honeypot />
          <input
            name="email"
            type="email"
            required
            disabled={busy}
            placeholder={t("email")}
            className="admin-input flex-1"
          />
          <button
            type="submit"
            disabled={busy}
            className="bg-ink px-6 py-3 text-[11px] tracking-[0.2em] uppercase text-sand disabled:opacity-60"
          >
            {busy ? t("sending") : t("submit")}
          </button>
        </div>
        <StatusMessage status={status} success={t("success")} error={t("error")} />
      </form>
    );
  }

  return (
    <form className="relative grid gap-4" onSubmit={onSubmit}>
      <Honeypot />
      <input name="name" required disabled={busy} placeholder={t("name")} className="admin-input" />
      <input
        name="email"
        type="email"
        required
        disabled={busy}
        placeholder={t("email")}
        className="admin-input"
      />
      <input name="phone" disabled={busy} placeholder={t("phone")} className="admin-input" />
      <textarea
        name="message"
        rows={5}
        required={type !== "visit"}
        disabled={busy}
        placeholder={t("message")}
        className="admin-input"
      />
      <button
        type="submit"
        disabled={busy}
        className="bg-ink px-6 py-3 text-[11px] tracking-[0.2em] uppercase text-sand hover:bg-sand hover:text-ink disabled:opacity-60"
      >
        {busy ? t("sending") : t("submit")}
      </button>
      <StatusMessage status={status} success={t("success")} error={t("error")} />
    </form>
  );
}

function Honeypot() {
  return (
    <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
      <label>
        Website
        <input name="website" type="text" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

function StatusMessage({
  status,
  success,
  error,
}: {
  status: Status;
  success: string;
  error: string;
}) {
  if (status === "ok") {
    return <p className="text-sm text-sand-deep">{success}</p>;
  }
  if (status === "error") {
    return <p className="text-sm text-red-700">{error}</p>;
  }
  return null;
}
