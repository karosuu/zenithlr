import { getTranslations, setRequestLocale } from "next-intl/server";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeSearch } from "@/components/home/HomeSearch";
import { ListingCard } from "@/components/listings/ListingCard";
import { ReviewQuote } from "@/components/reviews/ReviewQuote";
import { LeadForm } from "@/components/forms/LeadForm";
import { Link } from "@/i18n/routing";
import { tx } from "@/lib/i18n-text";
import { HOMEPAGE_REVIEW_LIMIT } from "@/lib/review-display";
import { getPage, getPublishedListings, getPublishedReviews, uniqueValues } from "@/lib/store";
import type { Locale } from "@/lib/types";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as "en" | "es");
  const loc = locale as Locale;
  const t = await getTranslations("filters");
  const tReviews = await getTranslations("reviews");
  const page = await getPage("home");
  const listings = await getPublishedListings();
  const featured = listings.filter((listing) => listing.featured).slice(0, 4);
  const { types, locations } = uniqueValues(listings);
  const publishedReviews = await getPublishedReviews();
  const reviews = publishedReviews
    .filter((review) => review.featured)
    .slice(0, HOMEPAGE_REVIEW_LIMIT);
  const showAllReviews = publishedReviews.length > reviews.length;

  return (
    <>
      <HomeHero url={tx(page.heroVideo, loc) || "/api/hero-video"}>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/25" />
        <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-end px-5 pb-20 pt-36 lg:px-8">
          <p className="text-[11px] tracking-[0.32em] uppercase text-sand">
            {tx(page.eyebrow, loc)}
          </p>
          <h1 className="font-serif mt-4 max-w-3xl text-5xl leading-tight text-white md:text-7xl">
            {tx(page.title, loc)}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/80">
            {tx(page.subtitle, loc)}
          </p>
          <HomeSearch locations={locations} types={types} />
        </div>
      </HomeHero>

      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-[11px] tracking-[0.28em] uppercase text-sand-deep">
              {tx(page.featuredEyebrow, loc)}
            </p>
            <h2 className="font-serif mt-3 text-4xl md:text-5xl">
              {tx(page.featuredTitle, loc)}
            </h2>
          </div>
          <Link
            href="/sell"
            className="hidden text-[11px] tracking-[0.2em] uppercase text-sand-deep hover:text-ink md:inline"
          >
            {t("viewAll")}
          </Link>
        </div>
        <div className="mt-12 grid auto-rows-fr gap-8 md:grid-cols-2 xl:grid-cols-4">
          {featured.map((listing) => (
            <ListingCard key={listing.id} listing={listing} locale={loc} />
          ))}
        </div>
      </section>

      <section className="border-y border-sand-soft bg-cream py-16">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <p className="text-center text-[11px] tracking-[0.28em] uppercase text-sand-deep">
            {tx(page.affiliationsTitle, loc)}
          </p>
          <div className="mt-10 grid items-center justify-items-center gap-10 sm:grid-cols-3">
            <img
              src="/affiliations/luxury-homes-expert.png"
              alt="Luxury Homes Expert"
              className="h-20 w-auto object-contain md:h-24"
            />
            <img
              src="/affiliations/cila.png"
              alt="CILA — Confederación Inmobiliaria Latinoamericana"
              className="h-14 w-auto object-contain md:h-16"
            />
            <img
              src="/affiliations/cbr.png"
              alt="Cámara Costarricense de Corredores de Bienes Raíces"
              className="h-20 w-auto object-contain md:h-24"
            />
          </div>
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="bg-ink py-24 text-paper">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="flex items-end justify-between gap-6">
              <h2 className="font-serif text-4xl">{tx(page.reviewsTitle, loc)}</h2>
              {showAllReviews ? (
                <Link
                  href="/reviews"
                  className="shrink-0 text-[11px] tracking-[0.2em] uppercase text-sand hover:text-paper"
                >
                  {tReviews("viewAll")}
                </Link>
              ) : null}
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2">
              {reviews.map((review) => (
                <ReviewQuote key={review.id} review={review} locale={loc} tone="dark" />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-3xl px-5 py-24 text-center lg:px-8">
        <h2 className="font-serif text-4xl">{tx(page.newsletterTitle, loc)}</h2>
        <div className="mt-8">
          <LeadForm type="newsletter" locale={loc} />
        </div>
      </section>
    </>
  );
}
