"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [touchX, setTouchX] = useState<number | null>(null);

  const active = images[selectedIndex] ?? images[0];
  const thumbStart = Math.max(
    0,
    Math.min(selectedIndex - PREVIEW_COUNT + 1, Math.max(0, images.length - PREVIEW_COUNT)),
  );
  const thumbs = images.slice(thumbStart, thumbStart + PREVIEW_COUNT);

  const go = useCallback(
    (dir: number) => {
      if (images.length < 2) return;
      setSelectedIndex((current) => (current + dir + images.length) % images.length);
    },
    [images.length],
  );

  const heading = (
    <>
      <p className="text-[11px] tracking-[0.16em] uppercase text-sand sm:text-sm md:text-base">
        {location}
      </p>
      <h1 className="font-serif mt-1 text-3xl text-white sm:mt-2 sm:text-5xl md:text-6xl">
        {title}
      </h1>
      <p className="mt-2 text-lg text-sand sm:mt-4 sm:text-2xl">{price}</p>
    </>
  );

  return (
    <section className="bg-ink">
      <div
        className="relative mx-auto aspect-[4/3] w-full max-h-[80vh] max-w-[min(100%,calc(80vh*4/3))]"
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
            src={active.url}
            alt={title}
            className="absolute inset-0 h-full w-full object-contain"
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-ink/35 max-sm:hidden" />
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 z-20 -translate-y-1/2 text-sand hover:text-white sm:left-4 lg:left-6"
              aria-label={t("prevPhoto")}
            >
              <Chevron dir="left" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 z-20 -translate-y-1/2 text-sand hover:text-white sm:right-4 lg:right-6"
              aria-label={t("nextPhoto")}
            >
              <Chevron dir="right" />
            </button>
          </>
        )}
        {images.length > 0 && (
          <p className="absolute bottom-3 right-4 z-20 text-[11px] tracking-[0.22em] uppercase text-sand sm:hidden">
            {selectedIndex + 1} / {images.length}
          </p>
        )}
        <div className="absolute inset-x-0 bottom-0 z-20 px-5 pb-10 max-sm:hidden lg:px-8">
          <div className="flex items-end justify-between gap-6">
            <div>{heading}</div>
            {images.length > 0 && (
              <p className="mb-1 shrink-0 text-[11px] tracking-[0.22em] uppercase text-sand">
                {selectedIndex + 1} / {images.length}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="px-5 py-5 sm:hidden">{heading}</div>

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
