import { getTranslations } from "next-intl/server";
import { ListingCard } from "./ListingCard";
import { ListingFilters } from "./ListingFilters";
import { filterListings, parseListingQuery, priceBounds, type ListingQuery } from "@/lib/filters";
import { uniqueValues } from "@/lib/store";
import type { Listing, ListingGoal, Locale } from "@/lib/types";

export async function ListingExplorer({
  listings,
  locale,
  searchParams,
  presetGoal,
  id,
}: {
  listings: Listing[];
  locale: Locale;
  searchParams: Record<string, string | string[] | undefined>;
  presetGoal?: ListingQuery["goal"];
  id?: string;
}) {
  const t = await getTranslations("filters");
  const query = parseListingQuery(searchParams);
  if (presetGoal && !searchParams.goal) query.goal = presetGoal;

  const scoped =
    query.goal && query.goal !== "all"
      ? listings.filter((listing) => listing.goals.includes(query.goal as ListingGoal))
      : listings;
  const bounds = priceBounds(scoped.length ? scoped : listings);
  const filtered = filterListings(listings, query);
  const { types, locations, rooms } = uniqueValues(listings);

  return (
    <section id={id} className="mx-auto max-w-7xl scroll-mt-36 px-5 py-16 lg:px-8">
      <ListingFilters
        query={query}
        types={types}
        locations={locations}
        rooms={rooms}
        bounds={bounds}
      />
      {filtered.length === 0 ? (
        <p className="py-20 text-center text-ink/60">{t("empty")}</p>
      ) : (
        <div className="mt-10 grid auto-rows-fr gap-8 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((listing) => (
            <ListingCard key={listing.id} listing={listing} locale={locale} />
          ))}
        </div>
      )}
    </section>
  );
}
