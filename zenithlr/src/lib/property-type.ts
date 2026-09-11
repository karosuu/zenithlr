import type { Localized } from "./types";

const KNOWN_PROPERTY_TYPES: Record<string, Localized> = {
  apartment: { en: "Apartment", es: "Apartamento" },
  apartamento: { en: "Apartment", es: "Apartamento" },
  home: { en: "Home", es: "Casa" },
  house: { en: "Home", es: "Casa" },
  casa: { en: "Home", es: "Casa" },
  "development land": { en: "Development Land", es: "Terreno de desarrollo" },
  terreno: { en: "Development Land", es: "Terreno de desarrollo" },
  "terreno de desarrollo": { en: "Development Land", es: "Terreno de desarrollo" },
  penthouse: { en: "Penthouse", es: "Penthouse" },
};

function lookupKey(value: string) {
  return value.trim().toLowerCase();
}

export function normalizePropertyType(
  value: Localized | string | undefined | null,
): Localized {
  if (!value) return { en: "", es: "" };

  if (typeof value === "string") {
    const known = KNOWN_PROPERTY_TYPES[lookupKey(value)];
    if (known) return { ...known };
    const trimmed = value.trim();
    return { en: trimmed, es: trimmed };
  }

  const en = value.en?.trim() ?? "";
  const es = value.es?.trim() ?? "";
  if (en && es) return { en, es };

  const known = KNOWN_PROPERTY_TYPES[lookupKey(en || es)];
  if (known) {
    return {
      en: en || known.en,
      es: es || known.es,
    };
  }

  return { en: en || es, es: es || en };
}

export function propertyTypeKey(value: Localized | string | undefined | null) {
  const type = normalizePropertyType(value);
  return type.en || type.es;
}

export function propertyTypeMatches(
  value: Localized | string | undefined | null,
  query: string,
) {
  const wanted = propertyTypeKey(query);
  return Boolean(wanted) && propertyTypeKey(value) === wanted;
}
