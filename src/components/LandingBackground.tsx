// Hero background for the dedicated lead-capture pages (/california,
// /optin): a looping, blurred aerial shot of homes (public/landing-bg.mp4),
// washed with a light scrim so white cards and dark text stay readable on
// top of it. Falls back to a still poster frame under prefers-reduced-motion
// via the CSS in globals.css rather than JS.
//
// The source clip is only ~3s, so it's built into a 27s boomerang loop
// (forward + reverse, slowed and frame-blended) via ffmpeg rather than
// looping the raw clip -- a 3s loop read as choppy/cheap, and reversing
// into itself means the loop point is seamless instead of a hard jump cut.
export function LandingBackground() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden bg-stone-100">
      {/* scale-110 keeps the blur filter from revealing soft edges at the
          container boundary (a blurred element's edges don't have anything
          to blur outward into, so without the extra scale you get a faint
          unblurred-looking fringe right at the viewport edge). */}
      <video
        className="landing-video absolute inset-0 w-full h-full object-cover scale-110 blur-lg"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/landing-bg-poster.jpg"
      >
        <source src="/landing-bg.mp4" type="video/mp4" />
      </video>
      <div
        className="landing-video-fallback absolute inset-0 w-full h-full bg-cover bg-center scale-110 blur-lg"
        style={{ backgroundImage: "url(/landing-bg-poster.jpg)" }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/75 to-white/90" />
    </div>
  );
}
