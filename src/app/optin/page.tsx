import Image from "next/image";
import { Playfair_Display } from "next/font/google";
import { LeadForm } from "@/components/LeadForm";
import { LandingSequenceBackground } from "@/components/LandingSequenceBackground";
import { MinimalSiteFooter } from "@/components/SiteFooter";
import { StickyCtaBar } from "@/components/StickyCtaBar";
import { RealtorBubble } from "@/components/RealtorBubble";
import { extractTrackingParams, singleParam } from "@/lib/utm";
import { getMetaLeadEventId } from "@/lib/meta";
import { submitLead } from "../lead-actions";

// Same serif as the homepage's own headlines and /california -- see that
// page's comment on why this (not the homepage) is where it matters most.
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600"] });

// Placeholder copy -- Paulin's providing the real PCS guide copy separately.
// Structure/workflow mirrors /california exactly so swapping in the final
// copy is a text-only change.
export const metadata = {
  title: "Nellis & Creech PCS Relocation Guide · Relocation Engine",
  description:
    "Get your free guide to a PCS move to Nellis AFB or Creech AFB: VA loan benefits, housing strategy, and what to expect.",
};

const VALUE_PROPS = ["$0 down with your VA loan", "BAH often covers your mortgage", "Housing matched to your commute"];

export default async function OptinPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const action = submitLead.bind(null, "optin", "/optin");
  const trackingFields = extractTrackingParams(params);
  const metaEventId = await getMetaLeadEventId();

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-16">
      <LandingSequenceBackground />
      <StickyCtaBar heroId="hero" formId="lead-form" label="Get My PCS Relocation Roadmap ↓" />

      <div className="relative z-10 w-full max-w-md lg:max-w-2xl">
        <div id="hero" className="text-center mb-7 lg:mb-10">
          <Image
            src="/logo-white.png"
            alt="Relocation Engine"
            width={680}
            height={546}
            className="h-12 lg:h-16 w-auto mx-auto mb-6 lg:mb-8"
            priority
          />
          <p className="text-xs lg:text-sm font-semibold uppercase tracking-wide text-amber-400 mb-3 lg:mb-4 drop-shadow-sm">
            Free relocation guide · 2026 Edition
          </p>
          <h1 className={`${playfair.className} text-3xl md:text-4xl lg:text-6xl text-white leading-tight drop-shadow-sm`}>
            Get My Nellis &amp; Creech PCS Roadmap
          </h1>
          <p className="text-sm md:text-base lg:text-xl text-white mt-3 lg:mt-5 leading-relaxed lg:max-w-xl lg:mx-auto drop-shadow-sm">
            Make the most of your PCS to Nellis AFB or Creech AFB. See how to use your VA loan
            benefits, lower your cost of living, and find the right neighborhood for your family.
          </p>
        </div>

        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 lg:gap-x-6 text-xs lg:text-base font-medium text-white mb-5 lg:mb-8 drop-shadow-sm">
          {VALUE_PROPS.map((item) => (
            <li key={item} className="flex items-center gap-1.5">
              <span className="text-amber-400">✓</span> {item}
            </li>
          ))}
        </ul>

        <p className="text-center text-xs lg:text-sm font-medium text-amber-900 bg-amber-50/90 border border-amber-200 rounded-lg px-3 py-2 lg:px-4 lg:py-3 mb-5 lg:mb-8">
          Orders in hand? DoD guidance recommends starting within 30 days of receiving them. The
          earlier you start, the more mover and home options you&apos;ll have.
        </p>

        <div id="lead-form" className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10">
          <LeadForm
            action={action}
            submitLabel="Get My PCS Relocation Roadmap"
            submitted={singleParam(params.lead_submitted) === "1"}
            hiddenFields={trackingFields}
            metaEventId={metaEventId}
            large
          />
        </div>

        <RealtorBubble />

        <p className="text-center text-xs lg:text-sm text-white/70 mt-5 lg:mt-7 drop-shadow-sm">
          VA Loan Benefits &amp; Housing Strategy by Paulin Korensia &amp; Associates Relocation Team
        </p>
        <MinimalSiteFooter />
      </div>
    </div>
  );
}
