import Image from "next/image";

export function PageHero({
  image,
  title,
  subtitle,
  ctaLabel,
  ctaHref,
}: {
  image: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <section className="relative flex min-h-[78vh] items-center justify-center overflow-hidden bg-ink">
      <Image
        src={image}
        alt=""
        fill
        priority
        className="hero-image-fx object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/35 via-ink/40 to-ink/55" />
      <div className="hero-overlay-fx relative z-10 mx-auto max-w-4xl px-5 pb-16 pt-40 text-center text-white lg:px-8">
        <h1 className="font-serif text-4xl leading-tight md:text-6xl">{title}</h1>
        {subtitle ? (
          <p className="font-serif mt-5 text-xl leading-relaxed text-white/90 md:text-2xl">
            {subtitle}
          </p>
        ) : null}
        {ctaLabel && ctaHref ? (
          <a
            href={ctaHref}
            className="mt-10 inline-flex border border-white/85 px-8 py-3 text-[11px] tracking-[0.22em] uppercase text-white transition hover:bg-white hover:text-ink"
          >
            {ctaLabel}
          </a>
        ) : null}
      </div>
    </section>
  );
}
