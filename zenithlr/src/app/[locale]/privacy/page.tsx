import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as "en" | "es");
  const t = await getTranslations("privacy");

  return (
    <section className="mx-auto max-w-2xl px-5 pb-24 pt-36">
      <div className="hero-overlay-fx">
        <h1 className="font-serif text-5xl">{t("title")}</h1>
        <p className="mt-8 leading-8 text-ink/75">{t("body")}</p>
      </div>
    </section>
  );
}
