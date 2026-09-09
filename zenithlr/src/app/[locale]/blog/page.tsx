import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageIntro } from "@/components/layout/PageIntro";
import { Link } from "@/i18n/routing";
import { tx } from "@/lib/i18n-text";
import { readingMinutes } from "@/lib/reading-time";
import { getPage, getPublishedPosts } from "@/lib/store";
import type { Locale } from "@/lib/types";

function formatPostDate(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "es" ? "es-CR" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as "en" | "es");
  const loc = locale as Locale;
  const t = await getTranslations("blog");
  const page = await getPage("blog");
  const posts = await getPublishedPosts();

  return (
    <>
      <PageIntro eyebrow={tx(page.eyebrow, loc)} title={tx(page.title, loc)} />
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        {posts.length === 0 ? (
          <p className="max-w-xl text-ink/60">{tx(page.empty, loc)}</p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={{ pathname: "/blog/[slug]", params: { slug: post.slug } }}
                className="group flex min-h-[280px] flex-col border border-sand-soft bg-cream p-6 shadow-[0_8px_24px_rgba(13,13,13,0.05)] transition hover:border-gold/50"
              >
                <span className="w-fit rounded-[6px] bg-gold px-2.5 py-1 text-[12px] font-semibold text-white">
                  {t("badge")}
                </span>
                <h2 className="font-serif mt-5 text-[22px] leading-snug text-ink md:text-[24px]">
                  {tx(post.title, loc)}
                </h2>
                <p className="mt-4 text-sm text-ink/55 group-hover:text-gold">{t("read")}</p>
                <div className="mt-auto flex items-center gap-3 border-t border-sand-soft pt-4 text-[12px] text-ink/45">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarIcon />
                    {formatPostDate(post.date, loc)}
                  </span>
                  <span aria-hidden>|</span>
                  <span className="inline-flex items-center gap-1.5">
                    <ClockIcon />
                    {t("minRead", { count: readingMinutes(tx(post.body, loc)) })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M8 3.5v3M16 3.5v3M3.5 10h17" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8v4.5l3 1.5" />
    </svg>
  );
}
