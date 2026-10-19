// Shared between the outbound timeline-check text (sent right after lead
// submission, see app/lead-actions.ts) and the inbound reply handler
// (app/api/webhooks/twilio-sms) that classifies the A/B/C reply -- one
// place for the three buckets instead of two copies that could drift.
export type Timeline = "immediate" | "60_90" | "90_120";

export const TIMELINE_LABELS: Record<Timeline, string> = {
  immediate: "Ready now",
  "60_90": "60–90 days",
  "90_120": "90–120 days",
};

// Urgency-ordered for sorting/display -- "immediate" first.
export const TIMELINE_ORDER: Timeline[] = ["immediate", "60_90", "90_120"];

// Client.timeline is a plain Prisma String? (not an enum), so anything read
// off the model is `string | null` until narrowed -- shared here rather
// than reimplemented wherever a component needs to decide whether to
// render a TimelineBadge for it.
export function isTimeline(value: string | null): value is Timeline {
  return value !== null && value in TIMELINE_LABELS;
}

// TODO: replace with Paulin's exact copy for each segment once she sends it
// (she mentioned two separate messages, one per audience). Kept here rather
// than inline in lead-actions.ts so both this and the real copy live in one
// place.
export const TIMELINE_SMS_BODY: Record<"pcs" | "california", string> = {
  pcs:
    "Quick question -- what's your PCS timeline? Reply A for immediately, B for 60-90 days, or C for 90-120 days.",
  california:
    "Quick question -- what's your moving timeline? Reply A for immediately, B for 60-90 days, or C for 90-120 days.",
};

// Twilio delivers the raw reply text as-is -- a real person might reply
// "A", "a.", "Option A", "B ", etc., not always the bare single letter this
// expects in the ideal case. Checking the first non-whitespace character
// covers all of those without trying to parse free-form timeline phrases
// (someone typing "probably around 3 months" is exactly the ambiguous case
// this intentionally returns null for, so it falls back to notifying
// Paulin rather than guessing).
export function classifyTimelineReply(body: string): Timeline | null {
  const firstChar = body.trim()[0]?.toUpperCase();
  if (firstChar === "A") return "immediate";
  if (firstChar === "B") return "60_90";
  if (firstChar === "C") return "90_120";
  return null;
}
