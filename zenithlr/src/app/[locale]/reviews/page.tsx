import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageIntro } from "@/components/layout/PageIntro";
import { ReviewQuote } from "@/components/reviews/ReviewQuote";
import { tx } from "@/lib/i18n-text";
import { getPage, getPublishedReviews } from "@/lib/store";
import type { Locale } from "@/lib/types";

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as "en" | "es");
  const loc = locale as Locale;
  const t = await getTranslations("reviews");
  const page = await getPage("reviews");
  const reviews = await getPublishedReviews();

  return (
    <>
      <PageIntro
        eyebrow={tx(page.eyebrow, loc)}
        title={tx(page.title, loc)}
        intro={tx(page.intro, loc) || undefined}
      />
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        {reviews.length === 0 ? (
          <p className="max-w-xl text-ink/60">{tx(page.empty, loc) || t("empty")}</p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {reviews.map((review) => (
              <ReviewQuote key={review.id} review={review} locale={loc} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
