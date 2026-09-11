import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { formatArea, formatPrice, tx } from "@/lib/i18n-text";
import type { Listing, Locale } from "@/lib/types";

export async function ListingCard({
  listing,
  locale,
}: {
  listing: Listing;
  locale: Locale;
}) {
  const t = await getTranslations("filters");
  const cover =
    listing.images.find((image) => image.isCover) ?? listing.images[0];
  const tags = listing.goals.map((goal) => {
    if (goal === "rent") return t("rent");
    if (goal === "sell") return t("sell");
    return t("investment");
  });

  return (
    <Link href={{ pathname: "/listing/[slug]", params: { slug: listing.slug } }} className="group block">
      <article className="bg-cream">
        <div className="relative aspect-[4/3] overflow-hidden bg-sand-soft">
          {cover && (
            <Image
              src={cover.url}
              alt={tx(listing.title, locale)}
              fill
              unoptimized={cover.url.startsWith("/uploads/")}
              className="object-cover transition duration-700 group-hover:scale-105"
              sizes="(min-width: 1024px) 33vw, 100vw"
            />
          )}
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-ink/85 px-2.5 py-1 text-[10px] tracking-[0.16em] uppercase text-sand"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="border border-t-0 border-sand-soft px-5 py-5">
          <p className="text-[11px] tracking-[0.2em] uppercase text-sand-deep">
            {listing.location}
          </p>
          <h3 className="font-serif mt-1 text-2xl">{tx(listing.title, locale)}</h3>
          <p className="mt-3 text-sm text-ink/70">
            {listing.lotArea
              ? formatArea(listing.lotArea, locale)
              : listing.bedrooms || listing.bathrooms
                ? `${listing.bedrooms} ${t("bed")} · ${listing.bathrooms} ${t("bath")}${
                    listing.constructionArea
                      ? ` · ${formatArea(listing.constructionArea, locale)}`
                      : ""
                  }`
                : tx(listing.propertyType, locale)}
          </p>
          <p className="mt-4 text-lg tracking-wide">
            {listing.price > 0
              ? formatPrice(listing.price, locale, listing.pricePeriod)
              : t("priceOnRequest")}
          </p>
          <p className="mt-4 text-[11px] tracking-[0.18em] uppercase text-sand-deep group-hover:text-ink">
            {t("seeMore")}
          </p>
        </div>
      </article>
    </Link>
  );
}
