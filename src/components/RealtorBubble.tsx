import Image from "next/image";
import { BUSINESS } from "@/lib/business";

// Credibility bubble for the dedicated lead-capture pages (/california,
// /optin) -- a visitor is about to hand their name/phone/email to what
// could be any faceless lead-gen funnel. A real photo, name, and license
// number right under the form is what makes "a licensed realtor, not a
// funnel" legible at a glance, right where it matters most.
//
// Full-body photo (paulin.jpg, the same one /about uses), framed in a
// rounded rectangle at its real 2:3 aspect ratio rather than cropped into
// a circle -- width/height below are that exact ratio (1333:2000) scaled
// down, so object-cover has nothing to crop.
export function RealtorBubble() {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-sm p-4 lg:p-5 mt-5 lg:mt-7 flex items-center gap-4 text-left">
      <Image
        src="/team/paulin.jpg"
        alt={BUSINESS.licensee}
        width={133}
        height={200}
        className="w-20 lg:w-24 h-auto rounded-xl object-cover shrink-0"
      />
      <div>
        <p className="text-sm lg:text-base font-semibold text-stone-900">{BUSINESS.licensee}</p>
        <p className="text-xs lg:text-sm font-medium text-amber-700">
          Licensed Nevada Realtor · License #{BUSINESS.nvLicense}
        </p>
        <p className="text-xs lg:text-sm text-stone-500 mt-1 leading-relaxed">
          You&apos;ll work with me personally, start to finish — no call centers, no hand-offs.
        </p>
      </div>
    </div>
  );
}
