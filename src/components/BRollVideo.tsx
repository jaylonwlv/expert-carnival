"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// Full-bleed background video for an editorial section, the homepage uses
// one of these per section (hero + each service), so this is a single
// shared, parameterized component rather than one bespoke component per
// clip.
//
// The poster is rendered as a next/image `fill` underneath the <video>,
// NOT as the video's own `poster` attribute: a <video poster> is fetched
// eagerly by the browser the instant the element is parsed, regardless of
// any `preload`/JS deferral on the clip itself, on a page with five of
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
//
// These clips are raw b-roll, not footage shot to loop seamlessly, the
// native `loop` attribute would jump-cut from the last frame straight back
// to the first the instant playback reaches the end. Looping is handled
// manually instead (handleTimeUpdate/handleEnded below), fading through
// that cut. The initial poster-to-video handoff, on the other hand, isn't
// faded, it just appears once playback starts (see transitionEnabled
// below).
const LOOP_FADE_MS = 500;

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
  // isPlaying controls opacity; transitionEnabled controls whether that
  // change animates. The very first reveal (poster -> live video) should
  // just appear, not fade, only the loop's fade-out/fade-in (masking the
  // jump-cut between the clip's last frame and its first) should animate.
  // Both start false so the first onPlaying flips isPlaying without
  // transitionEnabled having caught up yet (same render), landing on
  // opacity-100 instantly; transitionEnabled then turns on one frame
  // later, in time for the loop's own fade.
  const [isPlaying, setIsPlaying] = useState(false);
  const [transitionEnabled, setTransitionEnabled] = useState(false);
  const fadingOutRef = useRef(false);

  useEffect(() => {
    if (!isPlaying || transitionEnabled) return;
    const id = requestAnimationFrame(() => setTransitionEnabled(true));
    return () => cancelAnimationFrame(id);
  }, [isPlaying, transitionEnabled]);

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

    // Start fading out once the remaining playback time is less than the
    // fade's own duration, so the fade finishes right as the clip ends,
    // by the time `ended` fires and resets/restarts it, the video is
    // already (or very nearly) invisible, and the poster underneath is
    // what actually shows through during the cut.
    function handleTimeUpdate() {
      if (!video || !video.duration || fadingOutRef.current) return;
      if (video.duration - video.currentTime <= LOOP_FADE_MS / 1000) {
        fadingOutRef.current = true;
        setIsPlaying(false);
      }
    }

    function handleEnded() {
      if (!video) return;
      fadingOutRef.current = false;
      video.currentTime = 0;
      video.play().catch(() => {});
    }

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

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
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
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
        className={`absolute inset-0 w-full h-full object-cover ${transitionEnabled ? "transition-opacity duration-500 ease-out" : ""} ${isPlaying ? "opacity-100" : "opacity-0"} ${className}`}
        muted
        playsInline
        preload="none"
        onPlaying={() => setIsPlaying(true)}
      />
    </>
  );
}
