"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/layout/BrandLogo";

const SESSION_KEY = "zenith-hero-intro";
const MAX_MS = 1200;
const MIN_MS = 400;
const FADE_MS = 700;
const YT_API_SRC = "https://www.youtube.com/iframe_api";

const FRAME_CLASS =
  "hero-yt-frame pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2";

type YTPlayer = {
  mute: () => void;
  playVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  destroy: () => void;
};

type YTNamespace = {
  Player: new (
    el: HTMLElement,
    opts: {
      videoId: string;
      width?: string | number;
      height?: string | number;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (event: { target: YTPlayer }) => void;
        onStateChange?: (event: { data: number; target: YTPlayer }) => void;
      };
    },
  ) => YTPlayer;
  PlayerState: { ENDED: number };
};

type YTWindow = Window & {
  YT?: YTNamespace;
  onYouTubeIframeAPIReady?: () => void;
};

function getYT() {
  return (window as YTWindow).YT;
}

let youtubeApi: Promise<YTNamespace> | null = null;

function loadYouTubeAPI() {
  const existing = getYT();
  if (existing?.Player) return Promise.resolve(existing);
  if (youtubeApi) return youtubeApi;

  youtubeApi = new Promise((resolve) => {
    const win = window as YTWindow;
    const previous = win.onYouTubeIframeAPIReady;
    win.onYouTubeIframeAPIReady = () => {
      previous?.();
      const api = getYT();
      if (api?.Player) resolve(api);
    };
    if (!document.querySelector(`script[src="${YT_API_SRC}"]`)) {
      const script = document.createElement("script");
      script.src = YT_API_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
    const already = getYT();
    if (already?.Player) resolve(already);
  });

  return youtubeApi;
}

function youtubeId(url: string) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/,
  );
  return match?.[1] ?? "";
}

function isDirectVideo(url: string) {
  return /\.(mp4|webm|ogg)(\?|#|$)/i.test(url);
}

export function HomeHero({
  url,
  children,
}: {
  url: string;
  children: React.ReactNode;
}) {
  const id = youtubeId(url);
  const fileVideo = isDirectVideo(url);
  const mountRef = useRef<HTMLDivElement>(null);
  const [posterSrc, setPosterSrc] = useState(
    id ? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg` : "",
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

  useEffect(() => {
    if (fileVideo || !id) return;
    const mount = mountRef.current;
    if (!mount) return;

    const host = document.createElement("div");
    host.className = "h-full w-full";
    mount.appendChild(host);

    let player: YTPlayer | null = null;
    let cancelled = false;

    loadYouTubeAPI().then((YT) => {
      if (cancelled) return;
      player = new YT.Player(host, {
        videoId: id,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          iv_load_policy: 3,
          cc_load_policy: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            event.target.mute();
            event.target.playVideo();
            dismiss();
          },
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.ENDED) {
              event.target.seekTo(0, true);
              event.target.playVideo();
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      player?.destroy();
      host.remove();
    };
  }, [dismiss, fileVideo, id]);

  return (
    <section className="relative min-h-[92vh] overflow-hidden bg-ink">
      <div className="absolute inset-0 overflow-hidden bg-ink">
        {fileVideo ? (
          <video
            src={url}
            autoPlay
            muted
            loop
            playsInline
            onPlaying={dismiss}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <>
            {posterSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
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
            ) : null}
            <div ref={mountRef} className={FRAME_CLASS} />
          </>
        )}
        <div className="absolute inset-0" aria-hidden />
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
