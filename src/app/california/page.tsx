import Image from "next/image";
import Link from "next/link";
import { LeadForm } from "@/components/LeadForm";
import { LandingBackground } from "@/components/LandingBackground";
import { submitLead } from "../lead-actions";

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
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-3">
            Free relocation guide · 2026 Edition
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-stone-900 leading-tight">
            Get My Relocation Roadmap
          </h1>
          <p className="text-sm md:text-base text-stone-600 mt-3 leading-relaxed">
            Reclaim your wealth and space. See how relocating to Nevada lowers your cost of living
            while elevating your lifestyle.
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8">
          <LeadForm
            action={action}
            submitLabel="Get My Relocation Roadmap"
            submitted={params.lead_submitted === "1"}
            error={params.lead_error}
          />
        </div>

        <p className="text-center text-xs text-stone-500 mt-5">
          A Complete Tax &amp; Equity Transfer Strategy — Paulin Korensia &amp; Associates Relocation Team
        </p>
      </div>
    </div>
  );
}
