import { headers } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/blog/ArticleBody";
import { ArticleCover } from "@/components/blog/ArticleCover";
import { Link } from "@/i18n/routing";
import { tx } from "@/lib/i18n-text";
import { readingMinutes } from "@/lib/reading-time";
import { getPostBySlug } from "@/lib/store";
import type { Locale } from "@/lib/types";

function ShareLinks({
  shareUrl,
  shareText,
  share,
  facebook,
  whatsapp,
  linkedin,
}: {
  shareUrl: string;
  shareText: string;
  share: string;
  facebook: string;
  whatsapp: string;
  linkedin: string;
}) {
  return (
    <div className="mt-14 border-t border-sand-soft pt-8">
      <p className="text-[11px] tracking-[0.18em] uppercase text-sand-deep">{share}</p>
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink/70 hover:text-ink"
        >
          {facebook}
        </a>
        <a
          href={`https://wa.me/?text=${shareText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink/70 hover:text-ink"
        >
          {whatsapp}
        </a>
        <a
          href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink/70 hover:text-ink"
        >
          {linkedin}
        </a>
      </div>
    </div>
  );
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale as "en" | "es");
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const loc = locale as Locale;
  const t = await getTranslations("blog");
  const body = tx(post.body, loc);
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "zenithlr.com";
  const protocol = headerStore.get("x-forwarded-proto") ?? "https";
  const shareUrl = `${protocol}://${host}/${locale}/blog/${post.slug}`;
  const shareText = encodeURIComponent(`${tx(post.title, loc)} ${shareUrl}`);
  const share = (
    <ShareLinks
      shareUrl={shareUrl}
      shareText={shareText}
      share={t("share")}
      facebook={t("shareFacebook")}
      whatsapp={t("shareWhatsapp")}
      linkedin={t("shareLinkedin")}
    />
  );
  const footer = (
    <>
      {post.pdf ? (
        <a
          href={post.pdf}
          className="mt-8 inline-flex border border-gold px-6 py-3 text-[11px] tracking-[0.18em] uppercase text-gold hover:bg-gold hover:text-white"
        >
          {t("download")}
        </a>
      ) : null}
      {share}
    </>
  );

  return (
    <article className="bg-cream pt-40">
      <div className="mx-auto max-w-[1120px] px-5 lg:px-[30px]">
        <Link href="/blog" className="text-sm text-ink/60 hover:text-ink">
          ← {t("back")}
        </Link>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-sm text-ink/70">
          <span>
            {t("writtenBy")} <strong className="uppercase">{t("author")}</strong>
          </span>
          <span className="hidden h-7 w-px bg-sand-soft sm:block" aria-hidden />
          <span className="inline-flex items-center gap-2">
            <svg viewBox="0 0 18 18" className="h-4 w-4" fill="currentColor" aria-hidden>
              <path d="M8.5 5.05a.5.5 0 0 0-.5.5V9c0 .16.07.3.2.4l2.26 1.75a.5.5 0 1 0 .6-.8L9 8.75V5.55a.5.5 0 0 0-.5-.5Z" />
              <path d="M16.6 7.16a.5.5 0 0 0-.7.08l-.27.33A7.4 7.4 0 0 0 8.5 1.69 7.31 7.31 0 0 0 1.18 9 7.31 7.31 0 0 0 8.5 16.31a7.4 7.4 0 0 0 6.45-3.87.5.5 0 0 0-.9-.48 6.3 6.3 0 1 1 1.56-4.27l-.34-.26a.5.5 0 1 0-.62.79l1.29 1.02a.5.5 0 0 0 .71-.08l1.02-1.29a.5.5 0 0 0-.08-.71Z" />
            </svg>
            {t("readingTime", { count: readingMinutes(body) })}
          </span>
        </div>
      </div>

      <ArticleCover post={post} locale={loc} />

      {post.heroPhoto ? (
        <>
          <ArticleBody markdown={body} bandImage={post.heroBand} photoImage={post.heroPhoto} />
          <div className="mx-auto max-w-[1120px] px-5 pb-20 lg:px-[30px]">{footer}</div>
        </>
      ) : (
        <div className="border-t border-gold/30">
          <div className="mx-auto max-w-[1120px] px-5 pb-20 pt-12 lg:px-[30px]">
            <ArticleBody markdown={body} bandImage={post.heroBand} />
            {footer}
          </div>
        </div>
      )}
    </article>
  );
}
