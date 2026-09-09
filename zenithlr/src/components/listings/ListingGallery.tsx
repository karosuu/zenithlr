"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

const PREVIEW_COUNT = 4;

type GalleryImage = {
  id: string;
  url: string;
};

export function ListingGallery({
  images,
  title,
  location,
  price,
}: {
  images: GalleryImage[];
  title: string;
  location: string;
  price: string;
}) {
  const t = useTranslations("listing");
  const heroRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [touchX, setTouchX] = useState<number | null>(null);
  const [heroFit, setHeroFit] = useState<"cover" | "contain">("contain");

  const active = images[selectedIndex] ?? images[0];
  const thumbStart = Math.max(
    0,
    Math.min(selectedIndex - PREVIEW_COUNT + 1, Math.max(0, images.length - PREVIEW_COUNT)),
  );
  const thumbs = images.slice(thumbStart, thumbStart + PREVIEW_COUNT);

  const updateFit = useCallback(() => {
    const box = heroRef.current;
    const img = box?.querySelector<HTMLImageElement>("[data-hero-photo]");
    if (!box || !img?.naturalWidth) return;
    const scale = Math.max(
      box.clientWidth / img.naturalWidth,
      box.clientHeight / img.naturalHeight,
    );
    setHeroFit(scale > 1.2 ? "contain" : "cover");
  }, []);

  useEffect(() => {
    updateFit();
    window.addEventListener("resize", updateFit);
    return () => window.removeEventListener("resize", updateFit);
  }, [active?.id, updateFit]);

  const go = useCallback(
    (dir: number) => {
      if (images.length < 2) return;
      setSelectedIndex((current) => (current + dir + images.length) % images.length);
    },
    [images.length],
  );

  return (
    <section>
      <div
        ref={heroRef}
        className="relative h-[70vh] min-h-[480px] bg-ink"
        onTouchStart={(event) => setTouchX(event.changedTouches[0]?.clientX ?? null)}
        onTouchEnd={(event) => {
          if (touchX === null) return;
          const dx = (event.changedTouches[0]?.clientX ?? touchX) - touchX;
          setTouchX(null);
          if (dx > 50) go(-1);
          if (dx < -50) go(1);
        }}
      >
        {active && (
          <img
            key={active.id}
            data-hero-photo
            src={active.url}
            alt={title}
            onLoad={updateFit}
            className={`absolute inset-0 h-full w-full ${
              heroFit === "cover" ? "object-cover" : "object-contain"
            }`}
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-ink/35" />
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-4 top-1/2 z-20 -translate-y-1/2 text-sand hover:text-white lg:left-6"
              aria-label={t("prevPhoto")}
            >
              <Chevron dir="left" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-4 top-1/2 z-20 -translate-y-1/2 text-sand hover:text-white lg:right-6"
              aria-label={t("nextPhoto")}
            >
              <Chevron dir="right" />
            </button>
          </>
        )}
        <div className="absolute inset-x-0 bottom-0 z-20 mx-auto flex max-w-7xl items-end justify-between gap-6 px-5 pb-12 lg:px-8">
          <div>
            <p className="text-[11px] tracking-[0.24em] uppercase text-sand">{location}</p>
            <h1 className="font-serif mt-2 text-5xl text-white md:text-6xl">{title}</h1>
            <p className="mt-4 text-2xl text-sand">{price}</p>
          </div>
          {images.length > 0 && (
            <p className="mb-1 hidden text-[11px] tracking-[0.22em] uppercase text-sand sm:block">
              {selectedIndex + 1} / {images.length}
            </p>
          )}
        </div>
      </div>

      {thumbs.length > 1 && (
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-5 py-6 lg:grid-cols-4 lg:px-8">
          {thumbs.map((image) => {
            const index = images.findIndex((item) => item.id === image.id);
            const selected = index === selectedIndex;
            return (
              <button
                key={image.id}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`group relative aspect-[4/3] overflow-hidden bg-sand-soft ${
                  selected ? "ring-1 ring-sand" : "opacity-80 hover:opacity-100"
                }`}
                aria-label={`${title} ${index + 1}`}
                aria-current={selected}
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover transition duration-700 group-hover:scale-105"
                  sizes="(min-width: 1024px) 25vw, 50vw"
                />
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-current stroke-[1.4]" aria-hidden>
      {dir === "left" ? (
        <path d="M15 5 8 12l7 7" />
      ) : (
        <path d="M9 5 16 12l-7 7" />
      )}
    </svg>
  );
}
