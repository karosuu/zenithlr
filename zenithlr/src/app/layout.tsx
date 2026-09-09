import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { ZENITH_CSS } from "@/lib/zenith-css-content";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Zenith Luxury Realty",
    template: "%s | Zenith Luxury Realty",
  },
  description:
    "Luxury real estate in Costa Rica. Rent, sell, and invest with a boutique team.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/logo-icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "Zenith Luxury Realty",
    description:
      "Luxury real estate in Costa Rica. Rent, sell, and invest with a boutique team.",
    images: [{ url: "/logo.png", width: 660, height: 626, alt: "Zenith Luxury Realty" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${cormorant.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <head>
        {/* Inline CSS: TMDHosting often fails to serve /_next/static/css and public *.css */}
        <style
          id="zenith-inline-css"
          dangerouslySetInnerHTML={{ __html: ZENITH_CSS }}
        />
      </head>
      <body className="min-h-full bg-paper text-ink">{children}</body>
    </html>
  );
}
