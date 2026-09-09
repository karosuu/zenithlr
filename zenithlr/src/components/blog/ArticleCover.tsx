import Image from "next/image";
import { tx } from "@/lib/i18n-text";
import type { Locale, Post } from "@/lib/types";

function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <p className={`text-[28px] font-extrabold tracking-[0.32em] ${light ? "text-gold" : "text-gold"}`}>
      ZENITH
      <small
        className={`mt-2 block text-[11px] font-normal tracking-[0.18em] ${light ? "text-white" : "text-ink/50"}`}
      >
        LUXURY REALTY
      </small>
    </p>
  );
}

export function ArticleCover({ post, locale }: { post: Post; locale: Locale }) {
  const title = tx(post.title, locale);
  const excerpt = tx(post.excerpt, locale);
  const role = tx(post.role, locale);

  if (post.heroImage) {
    return (
      <section className="relative mt-8 flex min-h-[650px] items-center overflow-hidden text-white md:min-h-[760px]">
        <Image src={post.heroImage} alt="" fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/[0.68] to-black/[0.28]" />
        <div className="relative z-10 mx-auto w-full max-w-[1180px] px-6 py-16 md:px-16 md:py-[90px]">
          <p className="text-[23px] font-extrabold tracking-[0.35em] text-gold md:text-[30px]">
            ZENITH
            <small className="mt-3 block text-[12px] font-normal tracking-[0.02em] text-white">
              LUXURY REALTY
            </small>
          </p>
          <div className="mt-9 h-[3px] w-[120px] bg-gold md:mt-[52px] md:w-[180px]" />
          <h1 className="mt-[54px] max-w-[620px] text-[38px] font-extrabold uppercase leading-[0.98] md:mt-[78px] md:text-[64px]">
            {title}
          </h1>
          {excerpt && (
            <p className="mt-7 text-[15px] font-extrabold tracking-[0.08em] uppercase text-gold md:text-[20px]">
              {excerpt}
            </p>
          )}
          {post.author && (
            <p className="mt-[70px] text-sm tracking-[0.03em] md:mt-[160px]">
              <span className="block text-[15px] font-semibold tracking-[0.04em] uppercase">{post.author}</span>
              {role && <span className="mt-1 block text-white/80">{role}</span>}
            </p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-6 flex min-h-[610px] flex-col items-center justify-center bg-cream px-5 py-[70px] text-center">
      <BrandMark />
      <div className="mx-auto mt-11 h-[2px] w-[75px] bg-gold" />
      <h1 className="font-serif mx-auto mt-16 max-w-3xl text-4xl uppercase leading-tight text-ink md:text-5xl">
        {title}
      </h1>
      {excerpt && <p className="mx-auto mt-7 max-w-3xl text-lg text-ink/55">{excerpt}</p>}
      {post.author && (
        <p className="mt-20 font-extrabold uppercase tracking-[0.04em] text-ink">
          {post.author}
          {role && <small className="mt-1 block font-normal normal-case tracking-normal text-gold">{role}</small>}
        </p>
      )}
    </section>
  );
}
