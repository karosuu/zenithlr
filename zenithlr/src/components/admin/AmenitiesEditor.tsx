"use client";

import type { Localized } from "@/lib/types";

const emptyAmenity = (): Localized => ({ en: "", es: "" });

export function AmenitiesEditor({
  value,
  onChange,
}: {
  value: Localized[];
  onChange: (value: Localized[]) => void;
}) {
  const items = value.length ? value : [emptyAmenity()];

  const update = (index: number, next: Localized) => {
    const copy = items.map((item, itemIndex) => (itemIndex === index ? next : item));
    onChange(copy);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs tracking-[0.14em] uppercase text-sand-deep">Amenities</p>
        <button
          type="button"
          className="text-[11px] tracking-[0.16em] uppercase text-sand-deep hover:text-ink"
          onClick={() => onChange([...items, emptyAmenity()])}
        >
          Add amenity
        </button>
      </div>
      <p className="mt-2 text-sm text-ink/50">
        Each row is one amenity on the listing page, in English and Spanish.
      </p>
      <div className="mt-4 space-y-3">
        {items.map((item, index) => (
          <div key={index} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <label className="text-xs tracking-[0.14em] uppercase text-sand-deep">
              EN
              <input
                className="admin-input mt-2"
                value={item.en}
                onChange={(e) => update(index, { ...item, en: e.target.value })}
              />
            </label>
            <label className="text-xs tracking-[0.14em] uppercase text-sand-deep">
              ES
              <input
                className="admin-input mt-2"
                value={item.es}
                onChange={(e) => update(index, { ...item, es: e.target.value })}
              />
            </label>
            <button
              type="button"
              className="self-end py-3 text-[11px] tracking-[0.16em] uppercase text-ink/50 hover:text-ink"
              onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function compactAmenities(items: Localized[]) {
  return items.filter((item) => item.en.trim() || item.es.trim()).map((item) => ({
    en: item.en.trim(),
    es: item.es.trim() || item.en.trim(),
  }));
}
