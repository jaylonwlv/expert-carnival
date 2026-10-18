import Image from "next/image";
import { LeadForm } from "@/components/LeadForm";
import { LandingSequenceBackground } from "@/components/LandingSequenceBackground";
import { MinimalSiteFooter } from "@/components/SiteFooter";
import { StickyCtaBar } from "@/components/StickyCtaBar";
import { RealtorBubble } from "@/components/RealtorBubble";
import { submitLead } from "../lead-actions";

const VALUE_PROPS = [
  "No state income tax in Nevada",
  "Same budget, 2-3x more home",
  "Full support, financing to closing",
];

export const metadata = {
  title: "California to Las Vegas Relocation Guide · Relocation Engine",
  description:
    "Get your free guide to relocating from California to Las Vegas: lower your cost of living, keep your equity, elevate your lifestyle.",
};

export default async function CaliforniaPage({
  searchParams,
}: {
  searchParams: Promise<{ lead_submitted?: string }>;
}) {
  const params = await searchParams;
  const action = submitLead.bind(null, "california", "/california");

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-16">
      <LandingSequenceBackground />
      <StickyCtaBar heroId="hero" formId="lead-form" label="Get My Relocation Roadmap ↓" />

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
          <p className="text-xs lg:text-sm font-semibold uppercase tracking-wide text-amber-400 mb-3 lg:mb-4">
            Free relocation guide · 2026 Edition
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-white leading-tight">
            Get My Relocation Roadmap
          </h1>
          <p className="text-sm md:text-base lg:text-xl text-white mt-3 lg:mt-5 leading-relaxed lg:max-w-xl lg:mx-auto">
            Reclaim your wealth and space. See how relocating to Nevada lowers your cost of living
            while elevating your lifestyle.
          </p>
        </div>

        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 lg:gap-x-6 text-xs lg:text-base font-medium text-white mb-5 lg:mb-8">
          {VALUE_PROPS.map((item) => (
            <li key={item} className="flex items-center gap-1.5">
              <span className="text-amber-400">✓</span> {item}
            </li>
          ))}
        </ul>

        <div id="lead-form" className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10">
          <LeadForm
            action={action}
            submitLabel="Get My Relocation Roadmap"
            submitted={params.lead_submitted === "1"}
            large
          />
        </div>

        <RealtorBubble />

        <p className="text-center text-xs lg:text-sm text-white/70 mt-5 lg:mt-7">
          A Complete Tax &amp; Equity Transfer Strategy by Paulin Korensia &amp; Associates Relocation Team
        </p>
        <MinimalSiteFooter />
      </div>
    </div>
  );
}
