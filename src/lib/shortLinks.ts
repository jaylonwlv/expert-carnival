// Clean, front-facing redirect slugs for bio links in short-form content
// (TikTok, Instagram Reels, YouTube Shorts) where a full UTM-tagged URL is
// too long/ugly to put in a profile. Visiting relocationengine.com/<slug>
// redirects to the real landing page with utm_source/utm_medium already
// attached -- see app/[slug]/route.ts. A single-segment slug only fires
// when nothing else claims that path first (Next prefers a static route
// like /about over this dynamic one), so avoid reusing an existing page's
// name here.
export type ShortLink = {
  path: string;
  utmSource: string;
  utmMedium: string;
};

export const SHORT_LINKS: Record<string, ShortLink> = {
  tt: { path: "/", utmSource: "tiktok", utmMedium: "short_form" },
  ig: { path: "/", utmSource: "instagram", utmMedium: "short_form" },
  yt: { path: "/", utmSource: "youtube", utmMedium: "short_form" },
};
