import Image from "next/image";
import { BUSINESS } from "@/lib/business";

// Credibility bubble for the dedicated lead-capture pages (/california,
// /optin) -- a visitor is about to hand their name/phone/email to what
// could be any faceless lead-gen funnel. A real photo, name, and license
// number right under the form is what makes "a licensed realtor, not a
// funnel" legible at a glance, right where it matters most.
//
// A full-body photo is roughly 1:3.8 (tall and narrow) -- object-contain
// inside a circle leaves it letterboxed with the narrow photo's own
// corners rounded off by the circle, which reads as an oval rather than a
// clean circular portrait; object-cover on the full-body shot, on the
// other hand, clips her head/feet (a circle pinches in at its top and
// bottom). paulin-bust.jpg is a waist-up crop instead -- close enough to
// a square aspect ratio that object-cover fills the circle edge to edge,
// trimming only a sliver off the very top/bottom, nowhere near her face
// or hands.
export function RealtorBubble() {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-sm p-4 lg:p-5 mt-5 lg:mt-7 flex items-center gap-4 text-left">
      <Image
        src="/team/paulin-bust.jpg"
        alt={BUSINESS.licensee}
        width={160}
        height={160}
        className="w-20 h-20 lg:w-24 lg:h-24 rounded-full object-cover shrink-0"
      />
      <div>
        <p className="text-sm lg:text-base font-semibold text-stone-900">{BUSINESS.licensee}</p>
        <p className="text-xs lg:text-sm font-medium text-amber-700">
          Licensed Nevada Realtor · License #{BUSINESS.nvLicense}
        </p>
        <p className="text-xs text-stone-400">
          Brokered by {BUSINESS.brokerage} · CA DRE #{BUSINESS.caDre}
        </p>
        <p className="text-xs lg:text-sm text-stone-500 mt-1 leading-relaxed">
          You&apos;ll work with me personally, start to finish.
        </p>
      </div>
    </div>
  );
}
