import Image from "next/image";
import { BUSINESS } from "@/lib/business";

// Credibility bubble for the dedicated lead-capture pages (/california,
// /optin) -- a visitor is about to hand their name/phone/email to what
// could be any faceless lead-gen funnel. A real photo, name, and license
// number right under the form is what makes "a licensed realtor, not a
// funnel" legible at a glance, right where it matters most.
export function RealtorBubble() {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-sm p-4 lg:p-5 mt-5 lg:mt-7 flex items-center gap-4 text-left">
      <Image
        src="/team/paulin.jpg"
        alt={BUSINESS.licensee}
        width={96}
        height={96}
        className="w-16 h-16 lg:w-20 lg:h-20 rounded-full object-cover shrink-0"
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
