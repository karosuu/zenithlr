import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { LeadForm } from "@/components/forms/LeadForm";
import { FeatureList, ListingCopy } from "@/components/listings/ListingCopy";
import { ListingGallery } from "@/components/listings/ListingGallery";
import { formatArea, formatPrice, tx } from "@/lib/i18n-text";
import { sortListingImages } from "@/lib/listing-images";
import { getAgents, getListingBySlug } from "@/lib/store";
import type { Locale } from "@/lib/types";

export default async function ListingPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale as "en" | "es");
  const loc = locale as Locale;
  const listing = await getListingBySlug(slug, loc);
  if (!listing) notFound();
  const t = await getTranslations("listing");
  const tf = await getTranslations("filters");
  const agents = await getAgents();
  const agent = agents.find((item) => item.id === listing.agentId) ?? agents[0];
  const images = sortListingImages(listing.images);

  const specs = [
    listing.propertyId ? [t("id"), listing.propertyId] : null,
    listing.levels ? [t("levels"), String(listing.levels)] : null,
    listing.bedrooms ? [t("bedrooms"), String(listing.bedrooms)] : null,
    listing.bathrooms ? [t("bathrooms"), String(listing.bathrooms)] : null,
    listing.kitchen ? [t("kitchen"), String(listing.kitchen)] : null,
    listing.serviceRoom ? [t("service"), String(listing.serviceRoom)] : null,
    listing.constructionArea
      ? [t("construction"), formatArea(listing.constructionArea, loc)]
      : null,
    listing.lotArea ? [t("lot"), formatArea(listing.lotArea, loc)] : null,
    listing.yearBuilt ? [t("year"), String(listing.yearBuilt)] : null,
    listing.maintenanceFee ? [t("maintenance"), `$${listing.maintenanceFee}`] : null,
    listing.parking ? [t("parking"), String(listing.parking)] : null,
  ].filter(Boolean) as [string, string][];

  return (
    <article>
      <ListingGallery
        images={images.map((image) => ({ id: image.id, url: image.url }))}
        title={tx(listing.title, loc)}
        location={listing.location}
        price={
          listing.price > 0
            ? formatPrice(listing.price, loc, listing.pricePeriod)
            : tf("priceOnRequest")
        }
      />

      <div className="mx-auto grid max-w-7xl gap-16 px-5 py-16 lg:grid-cols-[1.4fr_0.8fr] lg:px-8">
        <div>
          <h2 className="font-serif text-3xl">{t("overview")}</h2>
          <dl className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3">
            {specs.map(([label, value]) => (
              <div key={label} className="border-t border-sand-soft pt-3">
                <dt className="text-[11px] tracking-[0.18em] uppercase text-sand-deep">{label}</dt>
                <dd className="mt-1 text-lg">{value}</dd>
              </div>
            ))}
          </dl>

          <h2 className="font-serif mt-16 text-3xl">{t("description")}</h2>
          <ListingCopy text={tx(listing.description, loc)} />

          {tx(listing.specialFeatures, loc).trim() ? (
            <>
              <h2 className="font-serif mt-16 text-3xl">{t("features")}</h2>
              <ListingCopy text={tx(listing.specialFeatures, loc)} />
            </>
          ) : null}

          {listing.amenities.length > 0 && (
            <>
              <h2 className="font-serif mt-16 text-3xl">{t("amenities")}</h2>
              <div className="mt-6">
                <FeatureList items={listing.amenities.map((item) => tx(item, loc))} />
              </div>
            </>
          )}

          {listing.faq.length > 0 && (
            <>
              <h2 className="font-serif mt-16 text-3xl">{t("faq")}</h2>
              <div className="mt-6 space-y-6">
                {listing.faq.map((item) => (
                  <div key={tx(item.question, loc)}>
                    <h3 className="font-medium">{tx(item.question, loc)}</h3>
                    <p className="mt-2 text-ink/70">{tx(item.answer, loc)}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <aside className="space-y-8">
          {agent && (
            <div className="border border-sand-soft bg-cream p-6">
              <p className="text-[11px] tracking-[0.2em] uppercase text-sand-deep">{t("agent")}</p>
              <div className="mt-4 flex items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden">
                  <Image src={agent.photo} alt={agent.name} fill className="object-cover" />
                </div>
                <div>
                  <p className="font-serif text-2xl">{agent.name}</p>
                  <p className="text-sm text-ink/60">{tx(agent.role, loc)}</p>
                </div>
              </div>
              <a
                href={`https://wa.me/${agent.whatsapp}`}
                className="mt-6 block bg-ink py-3 text-center text-[11px] tracking-[0.2em] uppercase text-sand"
              >
                WhatsApp
              </a>
            </div>
          )}

          <div className="border border-sand-soft bg-cream p-6">
            <h2 className="font-serif text-3xl">{t("visit")}</h2>
            <p className="mt-3 mb-6 text-sm text-ink/70">{t("visitBody")}</p>
            <LeadForm type="visit" listingSlug={listing.slug} locale={loc} />
          </div>
        </aside>
      </div>
    </article>
  );
}
