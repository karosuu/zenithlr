import { getTranslations, setRequestLocale } from "next-intl/server";
import { LeadForm } from "@/components/forms/LeadForm";
import { PageIntro } from "@/components/layout/PageIntro";
import { tx } from "@/lib/i18n-text";
import { getPage } from "@/lib/store";
import type { Locale } from "@/lib/types";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as "en" | "es");
  const loc = locale as Locale;
  const t = await getTranslations("forms");
  const page = await getPage("contact");

  return (
    <>
      <PageIntro
        eyebrow={tx(page.eyebrow, loc)}
        title={tx(page.title, loc)}
        intro={tx(page.intro, loc)}
      />
      <section className="mx-auto grid max-w-7xl gap-16 px-5 py-20 lg:grid-cols-2 lg:px-8">
        <div className="space-y-8">
          <div>
            <p className="text-[11px] tracking-[0.2em] uppercase text-sand-deep">
              {t("emailLabel")}
            </p>
            <a href="mailto:management@zenithlr.com" className="mt-2 block text-lg">
              management@zenithlr.com
            </a>
          </div>
          <div>
            <p className="text-[11px] tracking-[0.2em] uppercase text-sand-deep">{t("call")}</p>
            <p className="mt-2">+506 7107-0803</p>
            <p>+506 6294-2112</p>
          </div>
          <div>
            <p className="text-[11px] tracking-[0.2em] uppercase text-sand-deep">{t("office")}</p>
            <p className="mt-2">{tx(page.office, loc)}</p>
          </div>
        </div>
        <div>
          <h2 className="font-serif text-3xl">{tx(page.formTitle, loc)}</h2>
          <p className="mt-3 mb-8 text-ink/70">{tx(page.formBody, loc)}</p>
          <LeadForm type="contact" locale={loc} />
        </div>
      </section>
    </>
  );
}
