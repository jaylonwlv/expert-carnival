// Shared between the outbound timeline-check text (sent right after lead
// submission, see app/lead-actions.ts) and the inbound reply handler
// (app/api/webhooks/twilio-sms) that classifies the A/B/C reply — one
// place for the three buckets instead of two copies that could drift.
export type Timeline = "immediate" | "60_90" | "90_120";

export const TIMELINE_LABELS: Record<Timeline, string> = {
  immediate: "Ready now",
  "60_90": "Mid-term (3–6 months)",
  "90_120": "Long-term (6+ months)",
};

// Urgency-ordered for sorting/display — "immediate" first.
export const TIMELINE_ORDER: Timeline[] = ["immediate", "60_90", "90_120"];

// Client.timeline is a plain Prisma String? (not an enum), so anything read
// off the model is `string | null` until narrowed — shared here rather
// than reimplemented wherever a component needs to decide whether to
// render a TimelineBadge for it.
export function isTimeline(value: string | null): value is Timeline {
  return value !== null && value in TIMELINE_LABELS;
}

// Paulin's real copy, one per audience. California offers three options
// (A/B/C); PCS deliberately only offers two (A/B) — see
// classifyTimelineReply below for how that asymmetry is handled.
export const TIMELINE_SMS_BODY: Record<"pcs" | "california", string> = {
  pcs:
    "Hey there! We just emailed over your PCS relocation guide, hope it helps. Just curious, are you scheduled within the next 90 days?\n\nA) Yes, I'm moving soon\nB) No, my timeline is further out.\n\nHope to connect with you soon!",
  california:
    "Hey there! We just emailed over your Las Vegas relocation guide, hope it helps.\n\nJust curious, what's your target moving timeline?\nA) Immediately (0-3 months)\nB) Mid-term (3-6 months)\nC) Long-term / Just browsing (6+ months).\n\nHope to connect with you soon!",
};

// Twilio delivers the raw reply text as-is — a real person might reply
// "A", "a.", "Option A", "B ", etc., not always the bare single letter this
// expects in the ideal case. Checking the first non-whitespace character
// covers all of those without trying to parse free-form timeline phrases
// (someone typing "probably around 3 months" is exactly the ambiguous case
// this intentionally returns null for, so it falls back to notifying
// Paulin rather than guessing).
//
// The same letter means different things depending on which text the
// reply is answering: California's "B" is a specific mid-range (3-6
// months), but PCS's "B" ("my timeline is further out") is open-ended and
// reads as lower urgency, not a specific middle range — so it's bucketed
// with California's long-term "C" instead of its mid-term "B". PCS has no
// "C" option at all; a stray "C" from a PCS lead falls through to null
// (an unrecognized reply) rather than guessing what it meant.
export function classifyTimelineReply(body: string, isPCS: boolean): Timeline | null {
  const firstChar = body.trim()[0]?.toUpperCase();
  if (firstChar === "A") return "immediate";
  if (firstChar === "B") return isPCS ? "90_120" : "60_90";
  if (firstChar === "C" && !isPCS) return "90_120";
  return null;
}
