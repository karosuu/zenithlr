import type { MetadataRoute } from "next";
import { getPathname, routing } from "@/i18n/routing";
import { getAllListings, getPublishedPosts } from "@/lib/store";

const SITE_URL = (process.env.SITE_URL ?? "https://zenithlr.com").replace(
  /\/$/,
  "",
);

export const dynamic = "force-dynamic";

type AppHref = Parameters<typeof getPathname>[0]["href"];

const STATIC_PAGES: {
  href: AppHref;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
}[] = [
  { href: "/", changeFrequency: "weekly", priority: 1 },
  { href: "/rent", changeFrequency: "weekly", priority: 0.9 },
  { href: "/sell", changeFrequency: "weekly", priority: 0.9 },
  { href: "/about", changeFrequency: "monthly", priority: 0.7 },
  { href: "/blog", changeFrequency: "weekly", priority: 0.7 },
  { href: "/contact", changeFrequency: "monthly", priority: 0.6 },
  { href: "/reviews", changeFrequency: "monthly", priority: 0.6 },
  { href: "/privacy", changeFrequency: "yearly", priority: 0.3 },
];

function absoluteUrl(href: AppHref, locale: (typeof routing.locales)[number]) {
  return `${SITE_URL}${getPathname({ locale, href })}`;
}

function languagesFor(href: AppHref) {
  const languages: Record<string, string> = {
    "x-default": absoluteUrl(href, routing.defaultLocale),
  };
  for (const locale of routing.locales) {
    languages[locale] = absoluteUrl(href, locale);
  }
  return languages;
}

function entriesFor(
  href: AppHref,
  options: {
    lastModified?: Date | string;
    changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
    priority: number;
  },
): MetadataRoute.Sitemap {
  const languages = languagesFor(href);
  return routing.locales.map((locale) => ({
    url: languages[locale],
    lastModified: options.lastModified,
    changeFrequency: options.changeFrequency,
    priority: options.priority,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [listings, posts] = await Promise.all([
    getAllListings(),
    getPublishedPosts(),
  ]);

  const visibleListings = listings.filter(
    (listing) => listing.status !== "draft",
  );

  return [
    ...STATIC_PAGES.flatMap((page) =>
      entriesFor(page.href, {
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      }),
    ),
    ...visibleListings.flatMap((listing) =>
      entriesFor(
        { pathname: "/listing/[slug]", params: { slug: listing.slug } },
        {
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        },
      ),
    ),
    ...posts.flatMap((post) =>
      entriesFor(
        { pathname: "/blog/[slug]", params: { slug: post.slug } },
        {
          lastModified: post.date,
          changeFrequency: "monthly",
          priority: 0.6,
        },
      ),
    ),
  ];
}
