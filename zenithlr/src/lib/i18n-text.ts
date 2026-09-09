import type { Locale, Localized } from "./types";

export function tx(value: Localized | string | undefined, locale: Locale) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[locale] || value.en || value.es || "";
}

export function formatPrice(
  amount: number,
  locale: Locale,
  period: "sale" | "month" = "sale",
) {
  const formatted = new Intl.NumberFormat(locale === "es" ? "es-CR" : "en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

  if (period === "month") {
    return locale === "es" ? `${formatted}/mes` : `${formatted}/mo`;
  }
  return formatted;
}

export function formatArea(area: number, locale: Locale) {
  const formatted = new Intl.NumberFormat(locale === "es" ? "es-CR" : "en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(area);

  return `${formatted} m²`;
}
