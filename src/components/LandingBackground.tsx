// Decorative hero background for the public lead-capture pages -- slow
// blurred amber/stone color fields over a dark base, with a simple skyline
// silhouette along the bottom. Stands in for a real photo (homes at dusk,
// the Strip skyline) until one exists: self-contained, no licensing to
// track down, and already on the app's own warm stone/amber palette.
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
    <div aria-hidden className={`${fixed ? "fixed" : "absolute"} inset-0 -z-10 overflow-hidden bg-stone-950`}>
      <div
        className="landing-blob w-[700px] h-[700px] -top-48 -left-48 opacity-60"
        style={{ background: "radial-gradient(circle, #f59e0b, transparent 70%)" }}
      />
      <div
        className="landing-blob w-[600px] h-[600px] -bottom-56 -right-40 opacity-50"
        style={{ background: "radial-gradient(circle, #b45309, transparent 70%)", animationDuration: "32s", animationDelay: "-8s" }}
      />
      <div
        className="landing-blob w-[500px] h-[500px] top-1/4 right-1/4 opacity-40"
        style={{ background: "radial-gradient(circle, #78350f, transparent 70%)", animationDuration: "20s", animationDelay: "-4s" }}
      />

      {/* Warm horizon glow behind the skyline, like dusk light behind rooftops --
          without it the silhouette just reads as noise against the dark base. */}
      <div
        className="absolute bottom-0 left-0 w-full h-[26%] opacity-70"
        style={{ background: "linear-gradient(to top, #f59e0b 0%, rgba(245,158,11,0.35) 40%, transparent 100%)", filter: "blur(40px)" }}
      />

      <svg
        className="absolute bottom-0 left-0 w-full h-[30%] text-stone-950"
        viewBox="0 0 1440 300"
        preserveAspectRatio="none"
        fill="currentColor"
      >
        <rect x="0" y="180" width="70" height="120" />
        <rect x="80" y="140" width="50" height="160" />
        <rect x="140" y="200" width="90" height="100" />
        <rect x="245" y="110" width="40" height="190" />
        <rect x="300" y="170" width="65" height="130" />
        <rect x="380" y="60" width="36" height="240" />
        <rect x="430" y="190" width="100" height="110" />
        <rect x="545" y="130" width="55" height="170" />
        <rect x="615" y="170" width="70" height="130" />
        <rect x="700" y="40" width="42" height="260" />
        <rect x="755" y="150" width="60" height="150" />
        <rect x="830" y="195" width="90" height="105" />
        <rect x="935" y="100" width="38" height="200" />
        <rect x="985" y="165" width="70" height="135" />
        <rect x="1065" y="55" width="40" height="245" />
        <rect x="1115" y="185" width="95" height="115" />
        <rect x="1225" y="140" width="50" height="160" />
        <rect x="1290" y="195" width="80" height="105" />
        <rect x="1380" y="150" width="60" height="150" />
      </svg>

      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-stone-950/30" />
    </div>
  );
}
