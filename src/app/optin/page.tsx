import Image from "next/image";
import { LeadForm } from "@/components/LeadForm";
import { LandingBackground } from "@/components/LandingBackground";
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
  searchParams: Promise<{ lead_submitted?: string; lead_error?: string }>;
}) {
  const params = await searchParams;
  const action = submitLead.bind(null, "optin", "/optin");

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-16">
      <LandingBackground />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-7">
          <Image
            src="/logo.png"
            alt="Relocation Engine"
            width={680}
            height={546}
            className="h-16 w-auto mx-auto mb-6"
            priority
          />
          <p className="hero-text-glow text-xs font-semibold uppercase tracking-wide text-amber-700 mb-3">
            Free relocation guide · 2026 Edition
          </p>
          <h1 className="hero-text-glow text-3xl md:text-4xl font-bold text-stone-900 leading-tight">
            Get My Nellis &amp; Creech PCS Roadmap
          </h1>
          <p className="hero-text-glow text-sm md:text-base text-stone-800 mt-3 leading-relaxed">
            Make the most of your PCS to Nellis AFB or Creech AFB. See how to use your VA loan
            benefits, lower your cost of living, and find the right neighborhood for your family.
          </p>
        </div>

        <ul className="hero-text-glow flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs font-medium text-stone-800 mb-5">
          {VALUE_PROPS.map((item) => (
            <li key={item} className="flex items-center gap-1.5">
              <span className="text-amber-600">✓</span> {item}
            </li>
          ))}
        </ul>

        <p className="hero-text-glow text-center text-xs font-medium text-amber-900 bg-amber-50/90 border border-amber-200 rounded-lg px-3 py-2 mb-5">
          Orders in hand? DoD guidance recommends starting within 30 days of receiving them — the
          earlier you start, the more mover and home options you&apos;ll have.
        </p>

        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm p-4 mb-5">
          <HowItWorksSteps steps={HOW_IT_WORKS} />
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8">
          <LeadForm
            action={action}
            submitLabel="Get My PCS Relocation Roadmap"
            submitted={params.lead_submitted === "1"}
            error={params.lead_error}
          />
        </div>

        <p className="hero-text-glow text-center text-xs text-stone-700 mt-5">
          VA Loan Benefits &amp; Housing Strategy — Paulin Korensia &amp; Associates Relocation Team
        </p>
        <MinimalSiteFooter />
      </div>
    </div>
  );
}
