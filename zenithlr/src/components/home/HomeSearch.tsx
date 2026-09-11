"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { tx } from "@/lib/i18n-text";
import { propertyTypeKey } from "@/lib/property-type";
import type { Locale, Localized } from "@/lib/types";

export function HomeSearch({
  locations,
  types,
}: {
  locations: string[];
  types: Localized[];
}) {
  const t = useTranslations("filters");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [goal, setGoal] = useState("sell");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");

  return (
    <form
      className="mx-auto mt-10 grid max-w-4xl gap-3 bg-paper/95 p-4 text-ink shadow-xl md:grid-cols-4"
      onSubmit={(e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (goal) params.set("goal", goal);
        if (location) params.set("location", location);
        if (type) params.set("type", type);
        const pathname = goal === "rent" ? "/rent" : "/sell";
        router.push({
          pathname,
          query: Object.fromEntries(params.entries()),
        });
      }}
    >
      <select
        className="admin-input"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
      >
        <option value="rent">{t("rent")}</option>
        <option value="sell">{t("sell")}</option>
        <option value="investment">{t("investment")}</option>
      </select>
      <select
        className="admin-input"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      >
        <option value="">{t("location")}</option>
        {locations.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <select
        className="admin-input"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <option value="">{t("type")}</option>
        {types.map((item) => {
          const key = propertyTypeKey(item);
          return (
            <option key={key} value={key}>
              {tx(item, locale)}
            </option>
          );
        })}
      </select>
      <button
        type="submit"
        className="bg-ink px-4 py-3 text-[11px] tracking-[0.2em] uppercase text-sand hover:bg-sand hover:text-ink"
      >
        {t("search")}
      </button>
    </form>
  );
}
