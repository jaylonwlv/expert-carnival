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

// Android WebView sends this header as the exact package name of the app
// that opened the page -- a direct identifier, not a pattern match against
// a free-text string the way the UA is. Chrome proposed stripping it in
// 2023 over privacy concerns and required an opt-in allowlist API for
// anyone who still needed it, then reversed that decision; current Android
// WebView sends it by default again and the opt-in API is itself
// deprecated. Checked ahead of the Referer fallback since a package name is
// harder to end up looking like a platform by accident than a UA token is.
// iOS has no equivalent header, so this only ever helps on Android.
const PACKAGE_SIGNATURES: [string, string][] = [
  ["com.zhiliaoapp.musically", "tiktok"],
  ["com.ss.android.ugc.trill", "tiktok"],
  ["com.instagram.android", "instagram"],
  ["com.facebook.katana", "facebook"],
  ["com.facebook.lite", "facebook"],
  ["com.google.android.youtube", "youtube"],
];

// Last resort, for an app whose in-app browser doesn't mark itself in
// either the User-Agent or X-Requested-With -- most notably YouTube's
// Android "Custom Tab", which typically looks like plain Chrome with
// neither header set, but still sends a Referer back to the app that
// opened it.
const REFERER_SIGNATURES: [RegExp, string][] = [
  [/tiktok\.com|android-app:\/\/com\.zhiliao/, "tiktok"],
  [/instagram\.com|android-app:\/\/com\.instagram/, "instagram"],
  [/facebook\.com|android-app:\/\/com\.facebook/, "facebook"],
  [/youtube\.com|android-app:\/\/com\.google\.android\.youtube/, "youtube"],
];

export function detectInAppPlatform(
  userAgent: string | null,
  referer: string | null,
  requestedWith: string | null
): DetectedPlatform | null {
  const ua = (userAgent ?? "").toLowerCase();
  for (const [pattern, source] of UA_SIGNATURES) {
    if (pattern.test(ua)) return { source, medium: "in_app_browser" };
  }

  const packageName = (requestedWith ?? "").trim().toLowerCase();
  for (const [pkg, source] of PACKAGE_SIGNATURES) {
    if (packageName === pkg) return { source, medium: "in_app_browser" };
  }

  const ref = (referer ?? "").toLowerCase();
  for (const [pattern, source] of REFERER_SIGNATURES) {
    if (pattern.test(ref)) return { source, medium: "in_app_browser" };
  }

  return null;
}
