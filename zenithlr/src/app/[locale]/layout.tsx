import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PageFade } from "@/components/layout/PageFade";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/lib/types";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale as "en" | "es");
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="flex min-h-screen flex-col">
        <Header transparent />
        <main className="flex-1">
          <PageFade>{children}</PageFade>
        </main>
        <Footer locale={locale as Locale} />
        <WhatsAppButton />
      </div>
    </NextIntlClientProvider>
  );
}
