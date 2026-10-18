"use client";

import { useEffect, useRef } from "react";

// Full-bleed hero video for the homepage. Unlike LandingBackground (a
// fixed, blurred backdrop behind a form card on /california and /optin),
// this IS the hero image -- crisp, and scoped to its own section rather
// than the whole viewport.
//
// Same deferred-load approach as LandingBackground: the poster frame
// paints immediately, and the ~2MB clip only attaches once the browser is
// idle, so it never competes with the page's fonts/logo/CTAs on first
// load. Skipped entirely under prefers-reduced-motion.
export function HeroVideo() {
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
    <video
      ref={videoRef}
      className="absolute inset-0 w-full h-full object-cover"
      muted
      loop
      playsInline
      preload="none"
      poster="/landing-bg-poster.jpg"
    />
  );
}
