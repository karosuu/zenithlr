"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";

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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);
  const swipeX = useRef<number | null>(null);
  const didSwipe = useRef(false);

  const active = images[selectedIndex] ?? images[0];

  const go = useCallback(
    (dir: number) => {
      if (images.length < 2) return;
      setSelectedIndex((current) => (current + dir + images.length) % images.length);
    },
    [images.length],
  );

  const openAt = useCallback((index: number) => {
    setSelectedIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  const onSwipeStart = (event: React.TouchEvent) => {
    swipeX.current = event.changedTouches[0]?.clientX ?? null;
    didSwipe.current = false;
  };

  const onSwipeEnd = (event: React.TouchEvent) => {
    if (swipeX.current === null) return;
    const dx = (event.changedTouches[0]?.clientX ?? swipeX.current) - swipeX.current;
    swipeX.current = null;
    if (dx > 50) {
      didSwipe.current = true;
      go(-1);
    } else if (dx < -50) {
      didSwipe.current = true;
      go(1);
    }
  };

  const onHeroClick = () => {
    if (didSwipe.current) {
      didSwipe.current = false;
      return;
    }
    if (!active) return;
    openAt(selectedIndex);
  };

  const scrollStrip = useCallback((dir: number) => {
    const strip = stripRef.current;
    if (!strip) return;
    strip.scrollBy({
      left: dir * Math.max(strip.clientWidth * 0.75, 240),
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || images.length < 2) return;
    const thumb = strip.querySelector<HTMLElement>(`[data-thumb-index="${selectedIndex}"]`);
    if (!thumb) return;
    const left = thumb.offsetLeft;
    const right = left + thumb.offsetWidth;
    const viewLeft = strip.scrollLeft;
    const viewRight = viewLeft + strip.clientWidth;
    if (left < viewLeft + 8 || right > viewRight - 8) {
      strip.scrollTo({
        left: Math.max(0, left - (strip.clientWidth - thumb.offsetWidth) / 2),
        behavior: "smooth",
      });
    }
  }, [selectedIndex, images.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "ArrowRight") go(1);
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [lightboxOpen, closeLightbox, go]);

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
        onTouchStart={onSwipeStart}
        onTouchEnd={onSwipeEnd}
      >
        {active && (
          <img
            key={active.id}
            src={active.url}
            alt={title}
            onClick={onHeroClick}
            className="absolute inset-0 h-full w-full cursor-zoom-in object-contain"
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
          <p className="pointer-events-none absolute bottom-3 right-4 z-20 text-[11px] tracking-[0.22em] uppercase text-sand sm:hidden">
            {selectedIndex + 1} / {images.length}
          </p>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-5 pb-10 max-sm:hidden lg:px-8">
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

      {images.length > 1 && (
        <div className="relative mx-auto max-w-7xl px-5 py-6 lg:px-8">
          {images.length > 4 && (
            <>
              <button
                type="button"
                onClick={() => scrollStrip(-1)}
                className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 text-sand hover:text-white lg:block lg:left-0"
                aria-label={t("prevPhoto")}
              >
                <Chevron dir="left" />
              </button>
              <button
                type="button"
                onClick={() => scrollStrip(1)}
                className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 text-sand hover:text-white lg:block lg:right-0"
                aria-label={t("nextPhoto")}
              >
                <Chevron dir="right" />
              </button>
            </>
          )}
          <div
            ref={stripRef}
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {images.map((image, index) => {
              const selected = index === selectedIndex;
              return (
                <button
                  key={image.id}
                  type="button"
                  data-thumb-index={index}
                  onClick={() => openAt(index)}
                  className={`group relative aspect-[4/3] w-[min(70vw,18rem)] shrink-0 snap-start overflow-hidden bg-sand-soft lg:w-[calc((100%-2.25rem)/4)] ${
                    selected ? "ring-1 ring-sand" : "opacity-80 hover:opacity-100"
                  }`}
                  aria-label={`${title} ${index + 1}`}
                  aria-current={selected || undefined}
                >
                  <Image
                    src={image.url}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover transition duration-700 group-hover:scale-105"
                    sizes="(min-width: 1024px) 25vw, 70vw"
                  />
                </button>
              );
            })}
          </div>
          {images.length > 4 && (
            <div className="pointer-events-none absolute inset-y-6 right-5 w-10 bg-gradient-to-l from-ink to-transparent lg:right-8" />
          )}
        </div>
      )}

      {lightboxOpen &&
        active &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/95"
            onClick={() => {
              if (didSwipe.current) {
                didSwipe.current = false;
                return;
              }
              closeLightbox();
            }}
            onTouchStart={onSwipeStart}
            onTouchEnd={onSwipeEnd}
          >
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                closeLightbox();
              }}
              className="absolute right-4 top-4 z-10 text-sand hover:text-white sm:right-6 sm:top-6"
              aria-label={t("closeGallery")}
            >
              <CloseIcon />
            </button>
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    go(-1);
                  }}
                  className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-sand hover:text-white sm:left-6"
                  aria-label={t("prevPhoto")}
                >
                  <Chevron dir="left" />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    go(1);
                  }}
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-sand hover:text-white sm:right-6"
                  aria-label={t("nextPhoto")}
                >
                  <Chevron dir="right" />
                </button>
              </>
            )}
            <img
              key={active.id}
              src={active.url}
              alt={title}
              onClick={(event) => event.stopPropagation()}
              className="max-h-[90vh] max-w-[min(100%-2rem,90vw)] object-contain"
            />
            <p className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 text-[11px] tracking-[0.22em] uppercase text-sand">
              {selectedIndex + 1} / {images.length}
            </p>
          </div>,
          document.body,
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

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-current stroke-[1.4]" aria-hidden>
      <path d="M6 6 18 18M18 6 6 18" />
    </svg>
  );
}
