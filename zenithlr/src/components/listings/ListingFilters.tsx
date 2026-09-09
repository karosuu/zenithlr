"use client";

import { useMemo, useTransition } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import type { ListingQuery } from "@/lib/filters";

const TABS = ["all", "rent", "sell", "investment"] as const;

type Props = {
  query: ListingQuery;
  types: string[];
  locations: string[];
  rooms: number[];
  bounds: { min: number; max: number };
};

export function ListingFilters({ query, types, locations, rooms, bounds }: Props) {
  const t = useTranslations("filters");
  const router = useRouter();
  const pathname = usePathname();
  const [pending, start] = useTransition();

  const push = (next: Partial<ListingQuery>) => {
    const merged = { ...query, ...next };
    const params = new URLSearchParams();
    if (merged.goal && merged.goal !== "all") params.set("goal", merged.goal);
    if (merged.type) params.set("type", merged.type);
    if (merged.location) params.set("location", merged.location);
    if (merged.rooms) params.set("rooms", String(merged.rooms));
    if (merged.min != null && merged.min !== bounds.min) params.set("min", String(merged.min));
    if (merged.max != null && merged.max !== bounds.max) params.set("max", String(merged.max));
    if (merged.sort && merged.sort !== "default") params.set("sort", merged.sort);
    start(() =>
      router.replace(
        {
          pathname: pathname as "/rent" | "/sell" | "/",
          query: Object.fromEntries(params.entries()),
        },
        { scroll: false },
      ),
    );
  };

  const clear = () => {
    start(() =>
      router.replace(
        {
          pathname: pathname as "/rent" | "/sell" | "/",
          query: {},
        },
        { scroll: false },
      ),
    );
  };

  const isFiltered = Boolean(
    query.type ||
      query.location ||
      query.rooms ||
      (query.sort && query.sort !== "default") ||
      (query.min != null && query.min !== bounds.min) ||
      (query.max != null && query.max !== bounds.max),
  );

  const min = query.min ?? bounds.min;
  const max = query.max ?? bounds.max;
  const money = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }),
    [],
  );

  return (
    <div className={`border border-sand-soft bg-cream ${pending ? "opacity-70" : ""}`}>
      <div className="flex flex-wrap border-b border-sand-soft">
        {TABS.map((tab) => {
          const active = (query.goal ?? "all") === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => push({ goal: tab, min: undefined, max: undefined })}
              className={`px-5 py-3 text-[11px] tracking-[0.18em] uppercase ${
                active ? "bg-ink text-sand" : "text-ink/70 hover:text-ink"
              }`}
            >
              {t(tab)}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 p-5 md:grid-cols-2 lg:grid-cols-5">
        <label className="text-[11px] tracking-[0.16em] uppercase text-sand-deep">
          {t("type")}
          <select
            className="admin-input mt-2"
            value={query.type ?? "all"}
            onChange={(e) =>
              push({ type: e.target.value === "all" ? undefined : e.target.value })
            }
          >
            <option value="all">{t("type")}</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="text-[11px] tracking-[0.16em] uppercase text-sand-deep lg:col-span-1">
          {t("budget")}
          <div className="mt-3">
            <input
              type="range"
              min={bounds.min}
              max={bounds.max}
              step={1000}
              value={max}
              onChange={(e) => push({ min: bounds.min, max: Number(e.target.value) })}
              className="w-full accent-sand-deep"
            />
            <p className="mt-1 text-[11px] tracking-normal normal-case text-ink/70">
              {money.format(min)} — {money.format(max)}
            </p>
          </div>
        </label>

        <label className="text-[11px] tracking-[0.16em] uppercase text-sand-deep">
          {t("location")}
          <select
            className="admin-input mt-2"
            value={query.location ?? "all"}
            onChange={(e) =>
              push({ location: e.target.value === "all" ? undefined : e.target.value })
            }
          >
            <option value="all">{t("location")}</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </label>

        <label className="text-[11px] tracking-[0.16em] uppercase text-sand-deep">
          {t("rooms")}
          <select
            className="admin-input mt-2"
            value={query.rooms ?? "all"}
            onChange={(e) =>
              push({
                rooms: e.target.value === "all" ? undefined : Number(e.target.value),
              })
            }
          >
            <option value="all">{t("rooms")}</option>
            {rooms.map((count) => (
              <option key={count} value={count}>
                {t("roomsPlus", { count })}
              </option>
            ))}
          </select>
        </label>

        <label className="text-[11px] tracking-[0.16em] uppercase text-sand-deep">
          {t("sort")}
          <select
            className="admin-input mt-2"
            value={query.sort ?? "default"}
            onChange={(e) =>
              push({ sort: e.target.value as ListingQuery["sort"] })
            }
          >
            <option value="default">{t("sortDefault")}</option>
            <option value="date">{t("sortNew")}</option>
            <option value="asc">{t("sortAsc")}</option>
            <option value="desc">{t("sortDesc")}</option>
          </select>
        </label>
      </div>
      <div className="flex justify-end border-t border-sand-soft px-5 py-3">
        <button
          type="button"
          onClick={clear}
          disabled={!isFiltered}
          className="text-[11px] tracking-[0.18em] uppercase text-sand-deep hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t("clear")}
        </button>
      </div>
    </div>
  );
}
