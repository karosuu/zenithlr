import { tx } from "@/lib/i18n-text";
import type { Locale, Review } from "@/lib/types";

export function ReviewQuote({
  review,
  locale,
  tone = "light",
}: {
  review: Review;
  locale: Locale;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <blockquote className={`border-t pt-6 ${dark ? "border-sand/30" : "border-sand-soft"}`}>
      <p className={`text-sm leading-7 ${dark ? "text-paper/80" : "text-ink/75"}`}>
        {tx(review.quote, locale)}
      </p>
      <footer
        className={`mt-4 text-[11px] tracking-[0.2em] uppercase ${dark ? "text-sand" : "text-sand-deep"}`}
      >
        {review.author}
      </footer>
    </blockquote>
  );
}
