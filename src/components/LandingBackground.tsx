// Hero background for the public lead-capture pages: a looping aerial shot
// of homes (public/landing-bg.mp4), muted and washed with a light scrim so
// white cards and dark text stay readable on top of it. Falls back to a
// still poster frame under prefers-reduced-motion via the CSS in
// globals.css rather than JS, matching how .landing-blob was handled
// before this replaced it.
export function LandingBackground({
  fixed = true,
}: {
  // Dedicated lead pages use a fixed full-viewport background. The
  // homepage's hero instead scopes it to that section via an `absolute`
  // parent, so the page can still scroll into a normal light-themed body
  // below it.
  fixed?: boolean;
}) {
  return (
    <div aria-hidden className={`${fixed ? "fixed" : "absolute"} inset-0 -z-10 overflow-hidden bg-stone-100`}>
      <video
        className="landing-video absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster="/landing-bg-poster.jpg"
      >
        <source src="/landing-bg.mp4" type="video/mp4" />
      </video>
      <div
        className="landing-video-fallback absolute inset-0 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: "url(/landing-bg-poster.jpg)" }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/55 to-white/85" />
    </div>
  );
}
