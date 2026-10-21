import { STAGES } from "@/lib/stages";
import { Stepper } from "@/components/Stepper";

// A sneak peek at the real tracker, shown only after a lead converts,
// deliberately not on the landing page itself, so it never competes with
// the one actual ask (the lead form). Reuses the real Stepper/STAGES
// directly rather than a hand-drawn mockup, so this can never visually
// drift from the product it's previewing.
//
// "Lead" (index 0) is realtor-only, same reason TrackPage itself drops it
// (see app/track/[token]/page.tsx), a visitor who just submitted this
// form hasn't been called yet, so showing it here would be the same
// factually-wrong "you're further along than you are" problem that page
// already guards against. currentIndex={-1} marks every stage merely
// upcoming (no "done"/"in progress" state), accurate, since nothing has
// actually started yet.
export function TrackerPreview() {
  return (
    <div className="rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-1.5 bg-stone-100 border-b border-stone-200 px-4 py-2.5">
        <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
        <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
        <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
        <p className="flex-1 text-center text-xs font-medium text-stone-500">Your private tracker</p>
      </div>
      <div className="p-5">
        <p className="text-sm font-semibold text-stone-900 mb-1">
          Here&apos;s what you&apos;ll get once you&apos;re signed on
        </p>
        <p className="text-xs text-stone-500 mb-5">
          A private link that always shows exactly where your move stands.
        </p>
        <Stepper stages={STAGES.slice(1)} currentIndex={-1} colorOffset={1} />
      </div>
    </div>
  );
}
