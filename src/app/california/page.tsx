import Image from "next/image";
import Link from "next/link";
import { LeadForm } from "@/components/LeadForm";
import { GuideCover } from "@/components/GuideCover";
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
    <div className="min-h-screen bg-[#faf8f4]">
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <Link href="/">
            <Image src="/logo.png" alt="Relocation Engine" width={680} height={546} className="h-10 w-auto" priority />
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-3">
              Free relocation guide
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-stone-900 leading-tight">
              Get My Relocation Roadmap
            </h1>
            <p className="text-base text-stone-600 mt-4 leading-relaxed">
              Reclaim your wealth and space. See how relocating to Nevada lowers your cost of living
              while elevating your lifestyle.
            </p>

            <div className="mt-8 bg-white rounded-xl border border-stone-200 shadow-sm p-6">
              <LeadForm
                action={action}
                submitLabel="Get My Relocation Roadmap"
                submitted={params.lead_submitted === "1"}
                error={params.lead_error}
              />
            </div>
          </div>

          <div className="flex justify-center order-first md:order-last">
            <GuideCover
              title="CALIFORNIA TO LAS VEGAS RELOCATION GUIDE"
              subtitle="A Comprehensive Guide for Buyers & Investors, 2026 Edition"
              detail="A Complete Tax & Equity Transfer Strategy"
              credit="Paulin Korensia & Associates Relocation Team"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
