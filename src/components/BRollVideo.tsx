"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

// Full-bleed background video for an editorial section -- the homepage uses
// one of these per section (hero + each service), so this is a single
// shared, parameterized component rather than one bespoke component per
// clip.
//
// The poster is rendered as a next/image `fill` underneath the <video>,
// NOT as the video's own `poster` attribute: a <video poster> is fetched
// eagerly by the browser the instant the element is parsed, regardless of
// any `preload`/JS deferral on the clip itself -- on a page with five of
// these, that alone was pulling in ~900KB of posters for sections nobody
// had scrolled to yet. next/image's own lazy loading (on by default,
// `priority` only for the hero) fixes that for free, with a smaller,
// responsive asset to boot.
//
// The clip itself loads only once BOTH of:
// - idle: so a clip already in the viewport at page load (the hero) never
//   competes with the page's fonts/logo/CTAs for bandwidth on first load.
// - near-viewport (IntersectionObserver, 200px margin): so a clip further
//   down the page is never fetched until the visitor has actually
//   scrolled close to it.
// Skipped entirely under prefers-reduced-motion (the poster covers it).
export function BRollVideo({
  src,
  poster,
  className = "",
  priority = false,
}: {
  src: string;
  poster: string;
  className?: string;
  priority?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let idle = false;
    let near = false;
    let started = false;

    function maybeStart() {
      if (started || !idle || !near || !video) return;
      started = true;
      const source = document.createElement("source");
      source.src = src;
      source.type = "video/mp4";
      video.appendChild(source);
      video.load();
      video.play().catch(() => {});
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          near = true;
          maybeStart();
        }
      },
      { rootMargin: "200px 0px" }
    );
    observer.observe(video);

    let idleHandle: number | undefined;
    let timeoutId: number | undefined;
    if (typeof window.requestIdleCallback === "function") {
      idleHandle = window.requestIdleCallback(() => {
        idle = true;
        maybeStart();
      });
    } else {
      timeoutId = window.setTimeout(() => {
        idle = true;
        maybeStart();
      }, 0);
    }

    return () => {
      observer.disconnect();
      if (idleHandle !== undefined) window.cancelIdleCallback(idleHandle);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [src]);

  return (
    <>
      <Image
        src={poster}
        alt=""
        fill
        priority={priority}
        sizes="100vw"
        className={`object-cover ${className}`}
      />
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover ${className}`}
        muted
        loop
        playsInline
        preload="none"
      />
    </>
  );
}
