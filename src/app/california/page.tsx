import Image from "next/image";
import { LeadForm } from "@/components/LeadForm";
import { LandingBackground } from "@/components/LandingBackground";
import { MinimalSiteFooter } from "@/components/SiteFooter";
import { HowItWorksSteps } from "@/components/HowItWorksSteps";
import { TaxSavingsCalculator } from "@/components/TaxSavingsCalculator";
import { StickyCtaBar } from "@/components/StickyCtaBar";
import { submitLead } from "../lead-actions";

const VALUE_PROPS = [
  "No state income tax in Nevada",
  "Same budget, 2-3x more home",
  "Full support, financing to closing",
];

const HOW_IT_WORKS = ["Get your free guide", "Paulin calls you", "We find your next home"];

export const metadata = {
  title: "California to Las Vegas Relocation Guide · Relocation Engine",
  description:
    "Get your free guide to relocating from California to Las Vegas — lower your cost of living, keep your equity, elevate your lifestyle.",
};

export default async function CaliforniaPage({
  searchParams,
}: {
  searchParams: Promise<{ lead_submitted?: string; lead_error?: string }>;
}) {
  const params = await searchParams;
  const action = submitLead.bind(null, "california", "/california");

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-16">
      <LandingBackground />
      <StickyCtaBar heroId="hero" formId="lead-form" label="Get My Relocation Roadmap ↓" />

      <div className="relative z-10 w-full max-w-md">
        <div id="hero" className="text-center mb-7">
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
            Get My Relocation Roadmap
          </h1>
          <p className="hero-text-glow text-sm md:text-base text-stone-800 mt-3 leading-relaxed">
            Reclaim your wealth and space. See how relocating to Nevada lowers your cost of living
            while elevating your lifestyle.
          </p>
        </div>

        <ul className="hero-text-glow flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs font-medium text-stone-800 mb-5">
          {VALUE_PROPS.map((item) => (
            <li key={item} className="flex items-center gap-1.5">
              <span className="text-amber-600">✓</span> {item}
            </li>
          ))}
        </ul>

        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm p-4 mb-5">
          <HowItWorksSteps steps={HOW_IT_WORKS} />
        </div>

        <div className="mb-5">
          <TaxSavingsCalculator />
        </div>

        <div id="lead-form" className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8">
          <LeadForm
            action={action}
            submitLabel="Get My Relocation Roadmap"
            submitted={params.lead_submitted === "1"}
            error={params.lead_error}
          />
        </div>

        <p className="hero-text-glow text-center text-xs text-stone-700 mt-5">
          A Complete Tax &amp; Equity Transfer Strategy — Paulin Korensia &amp; Associates Relocation Team
        </p>
        <MinimalSiteFooter />
      </div>
    </div>
  );
}
