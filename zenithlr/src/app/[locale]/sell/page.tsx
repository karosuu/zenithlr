import { setRequestLocale } from "next-intl/server";
import { ListingExplorer } from "@/components/listings/ListingExplorer";
import { LeadForm } from "@/components/forms/LeadForm";
import { PageHero } from "@/components/layout/PageHero";
import { tx } from "@/lib/i18n-text";
import { getPage, getPublishedListings } from "@/lib/store";
import type { Locale } from "@/lib/types";

export default async function SellPage({
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
  const page = await getPage("sell");
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
        presetGoal="sell"
        id="properties"
      />
      <section className="bg-sand-soft px-5 py-20 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-serif text-4xl">{tx(page.ctaTitle, loc)}</h2>
            <p className="mt-4 leading-7 text-ink/70">{tx(page.ctaBody, loc)}</p>
          </div>
          <LeadForm type="sell-with-us" locale={loc} />
        </div>
      </section>
    </>
  );
}
