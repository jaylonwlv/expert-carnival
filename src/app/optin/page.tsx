import Image from "next/image";
import { LeadForm } from "@/components/LeadForm";
import { LandingSequenceBackground } from "@/components/LandingSequenceBackground";
import { MinimalSiteFooter } from "@/components/SiteFooter";
import { HowItWorksSteps } from "@/components/HowItWorksSteps";
import { submitLead } from "../lead-actions";

// Placeholder copy -- Paulin's providing the real PCS guide copy separately.
// Structure/workflow mirrors /california exactly so swapping in the final
// copy is a text-only change.
export const metadata = {
  title: "Nellis & Creech PCS Relocation Guide · Relocation Engine",
  description:
    "Get your free guide to a PCS move to Nellis AFB or Creech AFB — VA loan benefits, housing strategy, and what to expect.",
};

const VALUE_PROPS = ["$0 down with your VA loan", "BAH often covers your mortgage", "Housing matched to your commute"];

const HOW_IT_WORKS = ["Get your free guide", "Paulin calls you", "We plan around your report date"];

export default async function OptinPage({
  searchParams,
}: {
  searchParams: Promise<{ lead_submitted?: string }>;
}) {
  const params = await searchParams;
  const action = submitLead.bind(null, "optin", "/optin");

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-16">
      <LandingSequenceBackground />

      <div className="relative z-10 w-full max-w-md lg:max-w-2xl">
        <div className="text-center mb-7 lg:mb-10">
          <div className="inline-block bg-white/90 backdrop-blur-sm rounded-full pl-4 pr-5 py-2 lg:pl-5 lg:pr-6 lg:py-2.5 shadow-sm mb-6 lg:mb-8">
            <Image
              src="/logo.png"
              alt="Relocation Engine"
              width={680}
              height={546}
              className="h-7 lg:h-9 w-auto"
              priority
            />
          </div>
          <p className="text-xs lg:text-sm font-semibold uppercase tracking-wide text-amber-400 mb-3 lg:mb-4">
            Free relocation guide · 2026 Edition
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-white leading-tight">
            Get My Nellis &amp; Creech PCS Roadmap
          </h1>
          <p className="text-sm md:text-base lg:text-xl text-white/85 mt-3 lg:mt-5 leading-relaxed lg:max-w-xl lg:mx-auto">
            Make the most of your PCS to Nellis AFB or Creech AFB. See how to use your VA loan
            benefits, lower your cost of living, and find the right neighborhood for your family.
          </p>
        </div>

        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 lg:gap-x-6 text-xs lg:text-base font-medium text-white/85 mb-5 lg:mb-8">
          {VALUE_PROPS.map((item) => (
            <li key={item} className="flex items-center gap-1.5">
              <span className="text-amber-400">✓</span> {item}
            </li>
          ))}
        </ul>

        <p className="text-center text-xs lg:text-sm font-medium text-amber-900 bg-amber-50/90 border border-amber-200 rounded-lg px-3 py-2 lg:px-4 lg:py-3 mb-5 lg:mb-8">
          Orders in hand? DoD guidance recommends starting within 30 days of receiving them — the
          earlier you start, the more mover and home options you&apos;ll have.
        </p>

        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm p-4 lg:p-6 mb-5 lg:mb-8">
          <HowItWorksSteps steps={HOW_IT_WORKS} />
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10">
          <LeadForm
            action={action}
            submitLabel="Get My PCS Relocation Roadmap"
            submitted={params.lead_submitted === "1"}
            large
          />
        </div>

        <p className="text-center text-xs lg:text-sm text-white/70 mt-5 lg:mt-7">
          VA Loan Benefits &amp; Housing Strategy — Paulin Korensia &amp; Associates Relocation Team
        </p>
        <MinimalSiteFooter />
      </div>
    </div>
  );
}
