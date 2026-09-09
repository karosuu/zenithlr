import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["en", "es"],
  defaultLocale: "en",
  localePrefix: "always",
  pathnames: {
    "/": "/",
    "/rent": { en: "/rent", es: "/renta" },
    "/sell": { en: "/sell", es: "/venta" },
    "/about": { en: "/about", es: "/nosotros" },
    "/blog": { en: "/blog", es: "/blog" },
    "/blog/[slug]": { en: "/blog/[slug]", es: "/blog/[slug]" },
    "/contact": { en: "/contact", es: "/contacto" },
    "/reviews": { en: "/reviews", es: "/resenas" },
    "/listing/[slug]": { en: "/listing/[slug]", es: "/listing/[slug]" },
    "/privacy": { en: "/privacy", es: "/privacidad" },
  },
});

export type Locale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
