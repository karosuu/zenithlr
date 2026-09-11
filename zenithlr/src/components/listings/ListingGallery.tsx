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
  const heroRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef(0);
  const suppressThumbClick = useRef(false);
  const heroPressX = useRef<number | null>(null);
  const heroMoved = useRef(false);
  const heroStartScroll = useRef(0);

  selectedRef.current = selectedIndex;

  const active = images[selectedIndex] ?? images[0];

  const scrollHeroTo = useCallback((index: number, behavior: ScrollBehavior = "smooth") => {
    const hero = heroRef.current;
    if (!hero || hero.clientWidth === 0) return;
    hero.scrollTo({ left: index * hero.clientWidth, behavior });
  }, []);

  const scrollLightboxTo = useCallback((index: number, behavior: ScrollBehavior = "smooth") => {
    const box = lightboxRef.current;
    if (!box || box.clientWidth === 0) return;
    box.scrollTo({ left: index * box.clientWidth, behavior });
  }, []);

  const go = useCallback(
    (dir: number) => {
      if (images.length < 2) return;
      const current = selectedRef.current;
      const next = (current + dir + images.length) % images.length;
      const wrapping =
        (current === 0 && next === images.length - 1) ||
        (current === images.length - 1 && next === 0);
      selectedRef.current = next;
      setSelectedIndex(next);
      scrollHeroTo(next, wrapping ? "auto" : "smooth");
      if (lightboxOpen) scrollLightboxTo(next, wrapping ? "auto" : "smooth");
    },
    [images.length, lightboxOpen, scrollHeroTo, scrollLightboxTo],
  );

  const openAt = useCallback((index: number) => {
    selectedRef.current = index;
    setSelectedIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  const onHeroScroll = () => {
    const hero = heroRef.current;
    if (!hero || hero.clientWidth === 0) return;
    const next = Math.round(hero.scrollLeft / hero.clientWidth);
    if (next < 0 || next >= images.length || next === selectedRef.current) return;
    selectedRef.current = next;
    setSelectedIndex(next);
  };

  const onLightboxScroll = () => {
    const box = lightboxRef.current;
    if (!box || box.clientWidth === 0) return;
    const next = Math.round(box.scrollLeft / box.clientWidth);
    if (next < 0 || next >= images.length || next === selectedRef.current) return;
    selectedRef.current = next;
    setSelectedIndex(next);
  };

  const onHeroPointerDown = (event: React.PointerEvent) => {
    heroPressX.current = event.clientX;
    heroMoved.current = false;
    heroStartScroll.current = heroRef.current?.scrollLeft ?? 0;
  };

  const onHeroPointerMove = (event: React.PointerEvent) => {
    if (heroPressX.current === null) return;
    if (Math.abs(event.clientX - heroPressX.current) > 10) heroMoved.current = true;
  };

  const onHeroClick = () => {
    const scrolled = Math.abs((heroRef.current?.scrollLeft ?? 0) - heroStartScroll.current) > 10;
    if (heroMoved.current || scrolled) {
      heroMoved.current = false;
      return;
    }
    if (!active) return;
    openAt(selectedRef.current);
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
    const frame = window.requestAnimationFrame(() => {
      scrollLightboxTo(selectedRef.current, "auto");
      scrollHeroTo(selectedRef.current, "auto");
    });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "ArrowRight") go(1);
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [lightboxOpen, closeLightbox, go, scrollHeroTo, scrollLightboxTo]);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || images.length < 2) return;

    let pointerId: number | null = null;
    let startX = 0;
    let startScroll = 0;
    let dragging = false;

    const onPointerDown = (event: PointerEvent) => {
      startScroll = strip.scrollLeft;
      suppressThumbClick.current = false;
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      dragging = false;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (pointerId !== event.pointerId) return;
      const dx = event.clientX - startX;
      if (!dragging) {
        if (Math.abs(dx) < 8) return;
        dragging = true;
        suppressThumbClick.current = true;
        strip.style.scrollSnapType = "none";
        strip.setPointerCapture(event.pointerId);
      }
      strip.scrollLeft = startScroll - dx;
    };

    const onPointerUp = (event: PointerEvent) => {
      if (pointerId !== event.pointerId) return;
      pointerId = null;
      if (!dragging) return;
      dragging = false;
      strip.style.scrollSnapType = "";
      window.setTimeout(() => {
        suppressThumbClick.current = false;
      }, 80);
    };

    const onScroll = () => {
      if (Math.abs(strip.scrollLeft - startScroll) > 8) {
        suppressThumbClick.current = true;
      }
    };

    strip.addEventListener("pointerdown", onPointerDown);
    strip.addEventListener("pointermove", onPointerMove);
    strip.addEventListener("pointerup", onPointerUp);
    strip.addEventListener("pointercancel", onPointerUp);
    strip.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      strip.removeEventListener("pointerdown", onPointerDown);
      strip.removeEventListener("pointermove", onPointerMove);
      strip.removeEventListener("pointerup", onPointerUp);
      strip.removeEventListener("pointercancel", onPointerUp);
      strip.removeEventListener("scroll", onScroll);
    };
  }, [images.length]);

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
    <section className="min-w-0 bg-ink">
      <div className="relative mx-auto aspect-[4/3] w-full min-w-0 max-h-[80vh] max-w-[min(100%,calc(80vh*4/3))]">
        <div
          ref={heroRef}
          className="listing-h-scroll absolute inset-0 flex cursor-zoom-in snap-x snap-mandatory"
          onScroll={onHeroScroll}
          onPointerDown={onHeroPointerDown}
          onPointerMove={onHeroPointerMove}
          onClick={onHeroClick}
        >
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative h-full min-w-full shrink-0 snap-center"
              style={{ flex: "0 0 100%" }}
            >
              <img
                src={image.url}
                alt={index === 0 ? title : ""}
                draggable={false}
                loading={index === 0 ? "eager" : "lazy"}
                className="pointer-events-none h-full w-full cursor-zoom-in object-contain"
              />
            </div>
          ))}
        </div>
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
        <div className="relative mx-auto min-w-0 max-w-7xl px-5 py-6 lg:px-8">
          <button
            type="button"
            onClick={() => scrollStrip(-1)}
            className={`absolute left-1 top-1/2 z-10 -translate-y-1/2 text-sand hover:text-white sm:left-2 lg:left-0 ${
              images.length > 4 ? "" : "lg:hidden"
            }`}
            aria-label={t("prevPhoto")}
          >
            <Chevron dir="left" />
          </button>
          <button
            type="button"
            onClick={() => scrollStrip(1)}
            className={`absolute right-1 top-1/2 z-10 -translate-y-1/2 text-sand hover:text-white sm:right-2 lg:right-0 ${
              images.length > 4 ? "" : "lg:hidden"
            }`}
            aria-label={t("nextPhoto")}
          >
            <Chevron dir="right" />
          </button>
          <div
            ref={stripRef}
            className="listing-h-scroll flex cursor-grab snap-x snap-mandatory gap-3 pb-1 active:cursor-grabbing"
          >
            {images.map((image, index) => {
              const selected = index === selectedIndex;
              const selectThumb = () => {
                if (suppressThumbClick.current) {
                  suppressThumbClick.current = false;
                  return;
                }
                openAt(index);
              };
              return (
                <div
                  key={image.id}
                  role="button"
                  tabIndex={0}
                  data-thumb-index={index}
                  onClick={selectThumb}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      selectThumb();
                    }
                  }}
                  className={`group relative aspect-[4/3] w-[min(70vw,18rem)] shrink-0 cursor-pointer snap-start overflow-hidden bg-sand-soft select-none lg:w-[calc((100%-2.25rem)/4)] ${
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
                    draggable={false}
                    className="pointer-events-none object-cover transition duration-700 group-hover:scale-105"
                    sizes="(min-width: 1024px) 25vw, 70vw"
                  />
                </div>
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
            className="fixed inset-0 z-[100] bg-ink/95"
          >
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute right-4 top-4 z-10 text-sand hover:text-white sm:right-6 sm:top-6"
              aria-label={t("closeGallery")}
            >
              <CloseIcon />
            </button>
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-sand hover:text-white sm:left-6"
                  aria-label={t("prevPhoto")}
                >
                  <Chevron dir="left" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-sand hover:text-white sm:right-6"
                  aria-label={t("nextPhoto")}
                >
                  <Chevron dir="right" />
                </button>
              </>
            )}
            <div
              ref={lightboxRef}
              className="listing-h-scroll flex h-full w-full snap-x snap-mandatory"
              onScroll={onLightboxScroll}
            >
              {images.map((image) => (
                <div
                  key={image.id}
                  className="flex h-full min-w-full shrink-0 snap-center items-center justify-center px-4"
                  style={{ flex: "0 0 100%" }}
                  onClick={closeLightbox}
                >
                  <img
                    src={image.url}
                    alt={title}
                    draggable={false}
                    onClick={(event) => event.stopPropagation()}
                    className="max-h-[90vh] max-w-[min(100%,90vw)] object-contain"
                  />
                </div>
              ))}
            </div>
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
