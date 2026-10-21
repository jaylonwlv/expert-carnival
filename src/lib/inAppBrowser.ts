// Best-effort detection of a social app's in-app browser, for leads that
// land on a lead-capture page with no UTM tag at all (e.g. a plain
// relocationengine.com link shared in a bio or caption). This is a fallback
// signal, not a precise one -- it only says which app likely opened the
// page, not which post/video, and it says nothing once a link is copied out
// of the app into a real browser.
export type DetectedPlatform = {
  source: string;
  medium: string;
};

// Checked in order -- Instagram's and Facebook's in-app browsers share some
// Meta webview internals, so Instagram's own, more specific token is
// checked first to avoid it ever being mis-read as Facebook.
const UA_SIGNATURES: [RegExp, string][] = [
  [/tiktok|musical_ly|bytedancewebview/, "tiktok"],
  [/instagram/, "instagram"],
  [/fban|fbav|fb_iab/, "facebook"],
  [/\byoutube\b/, "youtube"],
];

// Fallback for an app whose in-app browser doesn't mark itself in the
// User-Agent at all -- most notably YouTube's Android "Custom Tab", which
// typically looks like plain Chrome there but still sends a Referer back to
// the app that opened it. Checked only when no UA signature above matched.
const REFERER_SIGNATURES: [RegExp, string][] = [
  [/tiktok\.com|android-app:\/\/com\.zhiliao/, "tiktok"],
  [/instagram\.com|android-app:\/\/com\.instagram/, "instagram"],
  [/facebook\.com|android-app:\/\/com\.facebook/, "facebook"],
  [/youtube\.com|android-app:\/\/com\.google\.android\.youtube/, "youtube"],
];

export function detectInAppPlatform(userAgent: string | null, referer: string | null): DetectedPlatform | null {
  const ua = (userAgent ?? "").toLowerCase();
  for (const [pattern, source] of UA_SIGNATURES) {
    if (pattern.test(ua)) return { source, medium: "in_app_browser" };
  }

  const ref = (referer ?? "").toLowerCase();
  for (const [pattern, source] of REFERER_SIGNATURES) {
    if (pattern.test(ref)) return { source, medium: "in_app_browser" };
  }

  return null;
}
