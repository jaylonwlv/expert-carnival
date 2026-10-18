import Image from "next/image";
import Link from "next/link";
import { LeadForm } from "@/components/LeadForm";
import { SiteFooter } from "@/components/SiteFooter";
import { TaxSavingsCalculator } from "@/components/TaxSavingsCalculator";
import { submitLead } from "./lead-actions";

export const metadata = {
  title: "Relocation Engine · Relocate to Las Vegas",
  description:
    "Full-service relocation to Las Vegas, from financing and home selection through closing and move-in.",
};

const SERVICES = [
  {
    title: "Financing & budget",
    body: "We work with your lender to confirm your pre-approval and total moving budget before you ever look at a listing.",
  },
  {
    title: "Home & area selection",
    body: "Curated listings and neighborhood breakdowns based on your must-haves — no generic search results.",
  },
  {
    title: "Touring, offers & closing",
    body: "From scheduling tours to negotiating your offer to the final walkthrough, we're with you at every step.",
  },
  {
    title: "A tracker just for you",
    body: "Once you're signed on, you get a private link that always shows exactly where your move stands.",
  },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ lead_submitted?: string }>;
}) {
  const params = await searchParams;
  const action = submitLead.bind(null, "homepage", "/");

  return (
    <div className="min-h-screen flex flex-col">
      <section className="bg-[#faf8f4]">
        <div className="max-w-3xl mx-auto px-4 py-20 md:py-28 text-center">
          <Image
            src="/logo.png"
            alt="Relocation Engine"
            width={680}
            height={546}
            className="h-16 w-auto mx-auto mb-8"
            priority
          />
          <h1 className="text-3xl md:text-5xl font-bold text-stone-900 leading-tight">
            Relocating to Las Vegas? We&apos;ll handle everything.
          </h1>
          <p className="text-base md:text-lg text-stone-600 mt-5 max-w-2xl mx-auto leading-relaxed">
            Full-service relocation support — from financing and home selection through closing and
            move-in — for California sellers and military PCS moves alike.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/california"
              className="rounded-md border border-stone-300 bg-white text-stone-800 text-sm font-medium px-4 py-2.5 shadow-sm hover:bg-stone-50 transition"
            >
              Moving from California?
            </Link>
            <Link
              href="/optin"
              className="rounded-md border border-stone-300 bg-white text-stone-800 text-sm font-medium px-4 py-2.5 shadow-sm hover:bg-stone-50 transition"
            >
              PCS orders to Las Vegas?
            </Link>
          </div>
        </div>
      </section>

      <main className="flex-1 bg-[#faf8f4]">
        <section className="max-w-5xl mx-auto px-4 py-16">
          <div className="grid sm:grid-cols-2 gap-5">
            {SERVICES.map((service) => (
              <div key={service.title} className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
                <h2 className="text-sm font-semibold text-stone-900">{service.title}</h2>
                <p className="text-sm text-stone-600 mt-2 leading-relaxed">{service.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-xl mx-auto px-4 pb-16 space-y-5">
          <TaxSavingsCalculator />

          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-stone-900 text-center">
              Get your free California to Las Vegas relocation guide
            </h2>
            <p className="text-sm text-stone-500 text-center mt-1 mb-6">
              Tell us a bit about yourself and we&apos;ll send it right over.
            </p>
            <LeadForm
              action={action}
              submitLabel="Get My Free Guide"
              submitted={params.lead_submitted === "1"}
            />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
