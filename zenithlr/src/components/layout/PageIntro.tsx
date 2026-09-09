export function PageIntro({
  eyebrow,
  title,
  intro,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
}) {
  return (
    <section className="bg-ink px-5 pb-16 pt-36 text-paper lg:px-8">
      <div className="hero-overlay-fx mx-auto max-w-7xl">
        {eyebrow ? (
          <p className="text-[11px] tracking-[0.32em] uppercase text-sand">{eyebrow}</p>
        ) : null}
        <h1 className="font-serif mt-4 max-w-3xl text-5xl md:text-6xl">{title}</h1>
        {intro ? <p className="mt-6 max-w-2xl text-paper/70">{intro}</p> : null}
      </div>
    </section>
  );
}
