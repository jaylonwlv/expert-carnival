"use client";

import { useEffect, useRef } from "react";

// Hero background for the dedicated lead-capture pages (/california,
// /optin): a looping, blurred aerial shot of homes (public/landing-bg.mp4),
// washed with a light scrim so white cards and dark text stay readable on
// top of it.
//
// The source clip is only ~3s, so it's built into a 27s boomerang loop
// (forward + reverse, slowed and frame-blended) via ffmpeg rather than
// looping the raw clip -- a 3s loop read as choppy/cheap, and reversing
// into itself means the loop point is seamless instead of a hard jump cut.
//
// The ~2MB file itself is deliberately NOT wired up as a <source> at render
// time: with `preload="auto"` (or plain `autoPlay`+a <source>), the browser
// fetches the full clip immediately, in parallel with -- and competing
// bandwidth against -- the page's fonts, logo, and lead form on first load.
// Instead the `poster` frame (a single ~160KB jpg) paints immediately, and
// the real video is only attached once the browser is idle, so it never
// delays anything the visitor is actually here to see or fill in. Under
// prefers-reduced-motion it's skipped entirely -- previously the browser
// still downloaded the full clip even though CSS hid the <video> element,
// since `display: none` doesn't stop a <video>'s own fetch.
export function LandingBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const start = () => {
      const source = document.createElement("source");
      source.src = "/landing-bg.mp4";
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
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden bg-stone-100">
      {/* scale-110 keeps the blur filter from revealing soft edges at the
          container boundary (a blurred element's edges don't have anything
          to blur outward into, so without the extra scale you get a faint
          unblurred-looking fringe right at the viewport edge). */}
      <video
        ref={videoRef}
        className="landing-video absolute inset-0 w-full h-full object-cover scale-110 blur-lg"
        muted
        loop
        playsInline
        preload="none"
        poster="/landing-bg-poster.jpg"
      />
      <div
        className="landing-video-fallback absolute inset-0 w-full h-full bg-cover bg-center scale-110 blur-lg"
        style={{ backgroundImage: "url(/landing-bg-poster.jpg)" }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/75 to-white/90" />
    </div>
  );
}
