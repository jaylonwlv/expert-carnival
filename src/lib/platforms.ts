// Fixed, stable identity -> color assignment for the platforms this app can
// actually attribute a lead to: the four lib/inAppBrowser.ts can detect,
// plus Google since it's the one paid-search utm_source Paulin tags by
// hand. Both the order and the color are fixed — never re-derived from
// which platform happens to have the most leads this week — so a given
// platform's color and position on the analytics chart stay the same
// release over release (see the "color follows the entity, never its
// rank" rule). Colors are the first five steps of the dataviz skill's
// validated 8-hue categorical sequence (references/palette.md); using a
// contiguous prefix of an already-validated adjacent-pair sequence keeps
// every adjacent pair here validated too (confirmed via
// scripts/validate_palette.js — all checks pass, with the documented
// contrast WARN mitigated by the chart's own visible count labels).
export const KNOWN_PLATFORMS = [
  { key: "tiktok", label: "TikTok", color: "#2a78d6" },
  { key: "instagram", label: "Instagram", color: "#eb6834" },
  { key: "facebook", label: "Facebook", color: "#1baf7a" },
  { key: "youtube", label: "YouTube", color: "#eda100" },
  { key: "google", label: "Google", color: "#e87ba4" },
] as const;

export type PlatformKey = (typeof KNOWN_PLATFORMS)[number]["key"];

// Deliberately not part of the categorical sequence above — these two
// aren't identities to tell apart from each other, they're "no identity
// captured," so they get neutral grays instead of spending two more
// precious, carefully-separated hues on non-platforms.
export const DIRECT_COLOR = "#898781";
export const OTHER_COLOR = "#c3c2b7";

export function classifyPlatform(utmSource: string | null): PlatformKey | "other" | "direct" {
  if (!utmSource) return "direct";
  const key = utmSource.trim().toLowerCase();
  const match = KNOWN_PLATFORMS.find((p) => p.key === key);
  return match ? match.key : "other";
}
