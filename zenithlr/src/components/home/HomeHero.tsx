"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/layout/BrandLogo";

const SESSION_KEY = "zenith-hero-intro";
const MAX_MS = 1200;
const MIN_MS = 400;
const FADE_MS = 700;

function youtubeId(url: string) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/,
  );
  return match?.[1] ?? url;
}

export function HomeHero({
  url,
  children,
}: {
  url: string;
  children: React.ReactNode;
}) {
  const id = youtubeId(url);
  const src = `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3`;
  const [posterSrc, setPosterSrc] = useState(
    `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
  );
  const [overlay, setOverlay] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const dismissed = useRef(false);
  const shownAt = useRef(Date.now());

  const dismiss = useCallback(() => {
    if (dismissed.current) return;
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") {
        dismissed.current = true;
        setOverlay(false);
        return;
      }
    } catch {
      /* private mode */
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      dismissed.current = true;
      setOverlay(false);
      return;
    }
    dismissed.current = true;
    const wait = Math.max(0, MIN_MS - (Date.now() - shownAt.current));
    window.setTimeout(() => {
      setLeaving(true);
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* private mode */
      }
    }, wait);
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      seen = false;
    }

    if (reduce || seen) {
      dismissed.current = true;
      setOverlay(false);
      return;
    }

    shownAt.current = Date.now();
    const timeout = window.setTimeout(dismiss, MAX_MS);
    return () => window.clearTimeout(timeout);
  }, [dismiss]);

  useEffect(() => {
    if (!leaving) return;
    const timeout = window.setTimeout(() => setOverlay(false), FADE_MS);
    return () => window.clearTimeout(timeout);
  }, [leaving]);

  return (
    <section className="relative min-h-[92vh] overflow-hidden bg-ink">
      <div className="absolute inset-0 overflow-hidden bg-ink">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={posterSrc}
          alt=""
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => {
            const fallback = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
            if (posterSrc !== fallback) setPosterSrc(fallback);
          }}
        />
        <iframe
          src={src}
          title="Zenith Luxury Realty"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          onLoad={dismiss}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 border-0"
        />
      </div>
      {children}
      {overlay ? (
        <div
          className={`hero-intro-overlay ${leaving ? "is-leaving" : ""}`}
          aria-hidden
        >
          <BrandLogo className="h-24 w-auto drop-shadow-[0_0_40px_rgba(220,201,165,0.18)] md:h-32" />
        </div>
      ) : null}
    </section>
  );
}
