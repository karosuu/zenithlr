import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { PageIntro } from "@/components/layout/PageIntro";
import { tx } from "@/lib/i18n-text";
import { getAgents, getPage } from "@/lib/store";
import type { Locale } from "@/lib/types";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as "en" | "es");
  const loc = locale as Locale;
  const page = await getPage("about");
  const agents = await getAgents();

  return (
    <>
      <PageIntro
        eyebrow={tx(page.eyebrow, loc)}
        title={tx(page.title, loc)}
        intro={tx(page.intro, loc)}
      />

      <section className="mx-auto max-w-7xl space-y-20 px-5 py-20 lg:px-8">
        {agents.map((agent) => {
          const title = agent.id === "bernal" ? page.bernalTitle : page.haroldTitle;
          const body = agent.id === "bernal" ? page.bernalBody : page.haroldBody;
          return (
            <article
              key={agent.id}
              className={`grid items-center gap-10 md:grid-cols-2 ${
                agent.id === "harold" ? "md:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div className="relative aspect-square overflow-hidden bg-sand-soft">
                <Image
                  src={agent.photo}
                  alt={agent.name}
                  fill
                  className="object-cover object-top"
                  sizes="(min-width: 768px) 50vw, 100vw"
                  priority={agent.id === "bernal"}
                />
              </div>
              <div>
                <p className="text-[11px] tracking-[0.22em] uppercase text-sand-deep">
                  {tx(agent.role, loc)}
                </p>
                <h2 className="font-serif mt-2 text-4xl">{tx(title, loc)}</h2>
                <p className="mt-6 whitespace-pre-line leading-8 text-ink/75">
                  {tx(body, loc)}
                </p>
              </div>
            </article>
          );
        })}
      </section>

      <section className="bg-sand-soft px-5 py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2">
          <div>
            <h2 className="font-serif text-3xl">{tx(page.missionTitle, loc)}</h2>
            <p className="mt-4 leading-8 text-ink/75">{tx(page.mission, loc)}</p>
          </div>
          <div>
            <h2 className="font-serif text-3xl">{tx(page.visionTitle, loc)}</h2>
            <p className="mt-4 leading-8 text-ink/75">{tx(page.vision, loc)}</p>
          </div>
        </div>
        <h2 className="mx-auto mt-16 max-w-7xl font-serif text-3xl">
          {tx(page.valuesTitle, loc)}
        </h2>
        <div className="mx-auto mt-8 grid max-w-7xl gap-8 md:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-cream p-8">
              <h3 className="font-serif text-2xl">
                {tx(page[`value${n}Title` as keyof typeof page], loc)}
              </h3>
              <p className="mt-3 text-sm leading-7 text-ink/70">
                {tx(page[`value${n}Body` as keyof typeof page], loc)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
