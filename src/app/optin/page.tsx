import Image from "next/image";
import Link from "next/link";
import { LeadForm } from "@/components/LeadForm";
import { LandingBackground } from "@/components/LandingBackground";
import { MinimalSiteFooter } from "@/components/SiteFooter";
import { submitLead } from "../lead-actions";

// Placeholder copy -- Paulin's providing the real PCS guide copy separately.
// Structure/workflow mirrors /california exactly so swapping in the final
// copy is a text-only change.
export const metadata = {
  title: "PCS to Las Vegas Relocation Guide · Relocation Engine",
  description:
    "Get your free guide to a military PCS move to Las Vegas — VA loan benefits, housing strategy, and what to expect.",
};

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
          <Link href="/" className="inline-block mb-6">
            <Image
              src="/logo.png"
              alt="Relocation Engine"
              width={680}
              height={546}
              className="h-9 w-auto mx-auto"
              priority
            />
          </Link>
          <p className="hero-text-glow text-xs font-semibold uppercase tracking-wide text-amber-700 mb-3">
            Free relocation guide · 2026 Edition
          </p>
          <h1 className="hero-text-glow text-3xl md:text-4xl font-bold text-stone-900 leading-tight">
            Get My PCS Relocation Roadmap
          </h1>
          <p className="hero-text-glow text-sm md:text-base text-stone-800 mt-3 leading-relaxed">
            Make the most of your PCS to Las Vegas. See how to use your VA loan benefits, lower your
            cost of living, and find the right neighborhood for your family.
          </p>
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
