import Image from "next/image";
import Link from "next/link";
import { LeadForm } from "@/components/LeadForm";
import { GuideCover } from "@/components/GuideCover";
import { submitLead } from "../lead-actions";

// Placeholder copy -- Paulin's providing the real PCS guide copy and cover
// image separately. Structure/workflow mirrors /california exactly so
// swapping in the final copy is a text-only change.
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
              Get My PCS Relocation Roadmap
            </h1>
            <p className="text-base text-stone-600 mt-4 leading-relaxed">
              Make the most of your PCS to Las Vegas. See how to use your VA loan benefits, lower your
              cost of living, and find the right neighborhood for your family.
            </p>

            <div className="mt-8 bg-white rounded-xl border border-stone-200 shadow-sm p-6">
              <LeadForm
                action={action}
                submitLabel="Get My PCS Relocation Roadmap"
                submitted={params.lead_submitted === "1"}
                error={params.lead_error}
              />
            </div>
          </div>

          <div className="flex justify-center order-first md:order-last">
            <GuideCover
              title="PCS TO LAS VEGAS RELOCATION GUIDE"
              subtitle="A Comprehensive Guide for Military Families, 2026 Edition"
              detail="VA Loan Benefits & Housing Strategy"
              credit="Paulin Korensia & Associates Relocation Team"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
