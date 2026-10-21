// Best-effort detection of a social app's in-app browser from its User-Agent
// string, for leads that land on a lead-capture page with no UTM tag at all
// (e.g. a plain relocationengine.com link shared in a bio or caption). This
// is a fallback signal, not a precise one -- it only says which app's
// webview rendered the page, not which post/video, and it says nothing once
// a link is copied out of the app into a real browser.
export type DetectedPlatform = {
  source: string;
  medium: string;
};

const UA_SIGNATURES: [RegExp, string][] = [
  [/tiktok|musical_ly|bytedancewebview/, "tiktok"],
  [/instagram/, "instagram"],
  [/fban|fbav|fb_iab/, "facebook"],
  [/\byoutube\b/, "youtube"],
];

export function detectInAppPlatform(userAgent: string | null): DetectedPlatform | null {
  if (!userAgent) return null;
  const ua = userAgent.toLowerCase();
  for (const [pattern, source] of UA_SIGNATURES) {
    if (pattern.test(ua)) return { source, medium: "in_app_browser" };
  }
  return null;
}
