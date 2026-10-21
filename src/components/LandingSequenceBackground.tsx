"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// Hero background for the dedicated lead-capture pages (/california,
// /optin): Paulin's own b-roll — pool, spiral stairs, atrium, patio —
// concatenated into one 26.5s sequence (public/broll/landing-sequence.mp4),
// crisp (not blurred, unlike the previous single-clip version) under a
// dark scrim so white text stays readable over it.
//
// Same deferred-load rationale as the rest of this session's video work:
// the poster frame paints immediately, and the real ~11MB clip only
// attaches once the browser is idle, so it never competes with the page's
// fonts/logo/lead form for bandwidth on first load — that deferral is what
// actually keeps this from delaying page load, on any device, not a width
// check. Skipped entirely under prefers-reduced-motion (the video element
// itself stays hidden via the .landing-video rule in globals.css; the
// next/image poster below is what shows through either way, so there's no
// separate fallback image to keep in sync with it).
//
// The poster is a next/image `fill`, not the <video>'s own `poster`
// attribute — same reasoning as BRollVideo.tsx: a <video poster> is
// fetched the instant the element is parsed, regardless of `preload`/JS
// deferral, which would reintroduce an eager, non-optimized, non-responsive
// fetch for exactly the element that's this page's actual LCP candidate.
export function LandingSequenceBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // This clip is ~11MB — still skip it on a connection that's actually
    // slow or metered (the visitor's own signal that a multi-megabyte
    // download isn't welcome right now), but otherwise play it on every
    // device, phones included. `navigator.connection` is Chromium/Android-
    // only (Safari/iOS never implemented it), so this doesn't catch every
    // slow connection — but the idle-deferred load above already means a
    // slow connection just makes the video arrive later, not the page.
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } })
      .connection;
    if (connection?.saveData || ["slow-2g", "2g", "3g"].includes(connection?.effectiveType ?? "")) return;

    const start = () => {
      const source = document.createElement("source");
      source.src = "/broll/landing-sequence.mp4";
      source.type = "video/mp4";
      video.appendChild(source);
      video.load();
      video.play().catch(() => {});
    };

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(start);
      return () => window.cancelIdleCallback(id);
    }
    const timeoutId = window.setTimeout(start, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden bg-stone-900">
      <Image
        src="/broll/landing-sequence-poster.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <video
        ref={videoRef}
        className={`landing-video absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-out ${isPlaying ? "opacity-100" : "opacity-0"}`}
        muted
        loop
        playsInline
        preload="none"
        onPlaying={() => setIsPlaying(true)}
      />

      {/* Lighter than the original flat black/60-45-70 wash — that read as
          muddy over Paulin's own photography (confirmed by eye, not just in
          theory) and this page is the one actually carrying paid traffic,
          so it's the first real impression most visitors get. Text over it
          (the hero heading/value props/tagline — anything not already
          sitting on its own white card) picks up drop-shadow-sm below to
          hold contrast now that the backing image is less uniformly dark. */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/50" />
    </div>
  );
}
