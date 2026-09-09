import { setRequestLocale } from "next-intl/server";
import { ListingExplorer } from "@/components/listings/ListingExplorer";
import { PageHero } from "@/components/layout/PageHero";
import { tx } from "@/lib/i18n-text";
import { getPage, getPublishedListings } from "@/lib/store";
import type { Locale } from "@/lib/types";

export default async function RentPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as "en" | "es");
  const loc = locale as Locale;
  const query = await searchParams;
  const page = await getPage("rent");
  const listings = await getPublishedListings();

  return (
    <>
      <PageHero
        image={tx(page.heroImage, loc) || "/heroes/sell-hero.png"}
        title={tx(page.title, loc)}
        subtitle={tx(page.subtitle, loc)}
        ctaLabel={tx(page.heroCta, loc)}
        ctaHref="#properties"
      />
      <ListingExplorer
        listings={listings}
        locale={loc}
        searchParams={query}
        presetGoal="rent"
        id="properties"
      />
    </>
  );
}
