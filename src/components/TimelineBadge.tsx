import { TIMELINE_LABELS, type Timeline } from "@/lib/timeline";

// Urgency-coded, same spirit as PCSBadge -- red for "ready now" so it's the
// one thing that actually draws the eye in a list of otherwise-similar
// rows, amber/stone for the less time-pressured buckets.
const COLORS: Record<Timeline, string> = {
  immediate: "text-red-700 bg-red-100",
  "60_90": "text-amber-700 bg-amber-100",
  "90_120": "text-stone-600 bg-stone-100",
};

export function TimelineBadge({ timeline }: { timeline: Timeline }) {
  return (
    <span className={`text-xs font-semibold rounded-full px-2 py-0.5 shrink-0 ${COLORS[timeline]}`}>
      {TIMELINE_LABELS[timeline]}
    </span>
  );
}
