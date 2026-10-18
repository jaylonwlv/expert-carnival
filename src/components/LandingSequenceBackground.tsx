"use client";

import { useEffect, useRef } from "react";

// Hero background for the dedicated lead-capture pages (/california,
// /optin): Paulin's own b-roll -- pool, spiral stairs, atrium, patio --
// concatenated into one 28s sequence (public/broll/landing-sequence.mp4),
// crisp (not blurred, unlike the previous single-clip version) under a
// dark scrim so white text stays readable over it.
//
// Same deferred-load rationale as the rest of this session's video work:
// the poster frame paints immediately, and the real ~8.5MB clip only
// attaches once the browser is idle, so it never competes with the page's
// fonts/logo/lead form for bandwidth on first load. Skipped entirely under
// prefers-reduced-motion -- the CSS swap below (.landing-video /
// .landing-video-fallback in globals.css) is the same rule the previous
// background used, reused as-is rather than duplicated.
export function LandingSequenceBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

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
      <video
        ref={videoRef}
        className="landing-video absolute inset-0 w-full h-full object-cover"
        muted
        loop
        playsInline
        preload="none"
        poster="/broll/landing-sequence-poster.jpg"
      />
      <div
        className="landing-video-fallback absolute inset-0 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: "url(/broll/landing-sequence-poster.jpg)" }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/70" />
    </div>
  );
}
