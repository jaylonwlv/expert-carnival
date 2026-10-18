import Image from "next/image";
import { BUSINESS } from "@/lib/business";

// Credibility bubble for the dedicated lead-capture pages (/california,
// /optin) -- a visitor is about to hand their name/phone/email to what
// could be any faceless lead-gen funnel. A real photo, name, and license
// number right under the form is what makes "a licensed realtor, not a
// funnel" legible at a glance, right where it matters most.
//
// Full-body photo (paulin.jpg, the same one /about uses) in a circular
// frame -- object-contain, not object-cover, so the whole photo (her
// included) is scaled to fit inside the circle rather than cropped by it.
// A circle pinches in toward its top and bottom, so object-cover's usual
// edge-to-edge crop would clip her head/feet there; object-contain keeps
// the full frame visible, letterboxed, with the background (already
// present on all sides in the source photo) filling the rest of the
// circle instead of her.
export function RealtorBubble() {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-sm p-4 lg:p-5 mt-5 lg:mt-7 flex items-center gap-4 text-left">
      <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden bg-stone-100 shrink-0 flex items-center justify-center">
        <Image
          src="/team/paulin.jpg"
          alt={BUSINESS.licensee}
          width={133}
          height={200}
          className="w-full h-full object-contain"
        />
      </div>
      <div>
        <p className="text-sm lg:text-base font-semibold text-stone-900">{BUSINESS.licensee}</p>
        <p className="text-xs lg:text-sm font-medium text-amber-700">
          Licensed Nevada Realtor · License #{BUSINESS.nvLicense}
        </p>
        <p className="text-xs lg:text-sm text-stone-500 mt-1 leading-relaxed">
          You&apos;ll work with me personally, start to finish. No call centers, no hand-offs.
        </p>
      </div>
    </div>
  );
}
