"use client";

import { useEffect, useState } from "react";
import { usePathname as useRawPathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { ContactBar } from "@/components/layout/ContactBar";
import { Link, usePathname } from "@/i18n/routing";

const NAV = [
  { href: "/" as const, key: "home" as const },
  { href: "/rent" as const, key: "rent" as const },
  { href: "/sell" as const, key: "sell" as const },
  { href: "/about" as const, key: "about" as const },
  { href: "/blog" as const, key: "blog" as const },
  { href: "/contact" as const, key: "contact" as const },
];

export function Header({ transparent = false }: { transparent?: boolean }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const rawPath = useRawPathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onHome = pathname === "/";
  const solid = !transparent || !onHome || scrolled || open;
  const other = locale === "en" ? "es" : "en";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid
          ? "bg-paper/95 border-b border-sand-soft backdrop-blur"
          : "bg-gradient-to-b from-ink/80 via-ink/35 to-transparent"
      }`}
    >
      <ContactBar />
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link href="/" className="flex items-center">
          <BrandLogo
            className={`h-11 w-auto sm:h-12 ${solid ? "" : "drop-shadow-[0_8px_18px_rgba(0,0,0,0.55)]"}`}
          />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[11px] tracking-[0.22em] uppercase transition-colors ${
                  solid
                    ? active
                      ? "text-sand-deep"
                      : "text-ink/70 hover:text-ink"
                    : active
                      ? "text-sand drop-shadow-[0_1px_8px_rgba(0,0,0,0.7)]"
                      : "text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.7)] hover:text-sand"
                }`}
              >
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <a
            href={rawPath.replace(/^\/(en|es)/, `/${other}`)}
            className={`text-[11px] tracking-[0.2em] uppercase ${
              solid ? "text-ink" : "text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.7)]"
            }`}
          >
            {other === "es" ? "ES" : "EN"}
          </a>
          <button
            type="button"
            className={`lg:hidden ${solid ? "text-ink" : "text-white"}`}
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            <span className="block h-px w-6 bg-current mb-1.5" />
            <span className="block h-px w-6 bg-current mb-1.5" />
            <span className="block h-px w-4 bg-current" />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-sand-soft bg-paper px-5 py-6 lg:hidden">
          <div className="flex flex-col gap-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-sm tracking-[0.18em] uppercase text-ink"
              >
                {t(item.key)}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
