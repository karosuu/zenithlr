import { getTranslations } from "next-intl/server";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { Link } from "@/i18n/routing";
import { getPage } from "@/lib/store";
import { tx } from "@/lib/i18n-text";
import type { Locale } from "@/lib/types";

export async function Footer({ locale }: { locale: Locale }) {
  const t = await getTranslations("nav");
  const footer = await getPage("footer");

  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <BrandLogo className="h-20 w-auto" />
          <p className="mt-4 max-w-md text-sm leading-7 text-sand-soft">
            {tx(footer.tagline, locale)}
          </p>
          <div className="mt-6 flex flex-col gap-3 text-sm">
            <a
              href="https://www.facebook.com/profile.php?id=61590554156172"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-paper/80 hover:text-sand"
              aria-label="Facebook Zenith LR"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                <path d="M22 12a10 10 0 1 0-11.56 9.88v-7H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v7A10 10 0 0 0 22 12Z" />
              </svg>
              Facebook
            </a>
            <a
              href="https://www.instagram.com/Zenithluxuryrealty"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-paper/80 hover:text-sand"
              aria-label="Instagram Zenith Luxury Realty"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                <path d="M12 7.2A4.8 4.8 0 1 0 16.8 12 4.8 4.8 0 0 0 12 7.2Zm0 7.9A3.1 3.1 0 1 1 15.1 12 3.1 3.1 0 0 1 12 15.1Zm6.2-8.2a1.1 1.1 0 1 1-1.1-1.1 1.1 1.1 0 0 1 1.1 1.1ZM12 4.4c1.6 0 1.8 0 2.5.1a4.3 4.3 0 0 1 1.4.3 2.7 2.7 0 0 1 1.5 1.5 4.3 4.3 0 0 1 .3 1.4c.1.7.1.9.1 2.5s0 1.8-.1 2.5a4.3 4.3 0 0 1-.3 1.4 2.7 2.7 0 0 1-1.5 1.5 4.3 4.3 0 0 1-1.4.3c-.7.1-.9.1-2.5.1s-1.8 0-2.5-.1a4.3 4.3 0 0 1-1.4-.3 2.7 2.7 0 0 1-1.5-1.5 4.3 4.3 0 0 1-.3-1.4c-.1-.7-.1-.9-.1-2.5s0-1.8.1-2.5a4.3 4.3 0 0 1 .3-1.4 2.7 2.7 0 0 1 1.5-1.5 4.3 4.3 0 0 1 1.4-.3c.7-.1.9-.1 2.5-.1Zm0-1.7c-1.6 0-1.8 0-2.5.1a6 6 0 0 0-2 .4 4.4 4.4 0 0 0-2.5 2.5 6 6 0 0 0-.4 2c-.1.7-.1.9-.1 2.5s0 1.8.1 2.5a6 6 0 0 0 .4 2 4.4 4.4 0 0 0 2.5 2.5 6 6 0 0 0 2 .4c.7.1.9.1 2.5.1s1.8 0 2.5-.1a6 6 0 0 0 2-.4 4.4 4.4 0 0 0 2.5-2.5 6 6 0 0 0 .4-2c.1-.7.1-.9.1-2.5s0-1.8-.1-2.5a6 6 0 0 0-.4-2 4.4 4.4 0 0 0-2.5-2.5 6 6 0 0 0-2-.4c-.7-.1-.9-.1-2.5-.1Z" />
              </svg>
              Instagram
            </a>
            <a
              href="https://www.tiktok.com/@barealestates_"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-paper/80 hover:text-sand"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                <path d="M19.6 7.8a5.4 5.4 0 0 1-3.2-1V15a5.5 5.5 0 1 1-5.5-5.5c.2 0 .5 0 .7.1v2.8a2.7 2.7 0 1 0 1.9 2.6V2.2h2.8a5.4 5.4 0 0 0 3.3 4.4V7.8Z" />
              </svg>
              @barealestates_
            </a>
            <a
              href="https://www.tiktok.com/@springer.real.estate"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-paper/80 hover:text-sand"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                <path d="M19.6 7.8a5.4 5.4 0 0 1-3.2-1V15a5.5 5.5 0 1 1-5.5-5.5c.2 0 .5 0 .7.1v2.8a2.7 2.7 0 1 0 1.9 2.6V2.2h2.8a5.4 5.4 0 0 0 3.3 4.4V7.8Z" />
              </svg>
              @springer.real.estate
            </a>
          </div>
        </div>
        <div className="flex flex-col gap-3 text-sm">
          <Link href="/rent" className="text-paper/80 hover:text-sand">
            {t("rent")}
          </Link>
          <Link href="/sell" className="text-paper/80 hover:text-sand">
            {t("sell")}
          </Link>
          <Link href="/about" className="text-paper/80 hover:text-sand">
            {t("about")}
          </Link>
          <Link href="/blog" className="text-paper/80 hover:text-sand">
            {t("blog")}
          </Link>
          <Link href="/contact" className="text-paper/80 hover:text-sand">
            {t("contact")}
          </Link>
        </div>
        <div className="text-sm leading-7 text-paper/80">
          <p>Escazú, San José</p>
          <p>
            <a href="mailto:management@zenithlr.com" className="hover:text-sand">
              management@zenithlr.com
            </a>
          </p>
          <p>
            Bernal Alvarado:{" "}
            <a href="tel:+50671070803" className="hover:text-sand">
              +506 7107-0803
            </a>
          </p>
          <p>
            Harold Springer:{" "}
            <a href="tel:+50662942112" className="hover:text-sand">
              +506 6294-2112
            </a>
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-5 py-6 text-xs text-paper/50 sm:flex-row sm:items-center lg:px-8">
          <p>{tx(footer.rights, locale)}</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/privacy" className="hover:text-sand">
              {locale === "es" ? "Política de privacidad" : "Privacy Policy"}
            </Link>
            <a
              href="https://pixel-craft.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="tracking-wide text-paper/70 hover:text-sand"
            >
              Empowered by Pixel-Craft
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
