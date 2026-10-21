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

// Same serif as the homepage's own headlines (page.tsx), this page and
// /optin are the ones actually carrying paid traffic, so they're the first
// impression most visitors get, and they shouldn't read as a plainer,
// more generic page than the homepage they'll likely never see.
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600"] });

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
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const action = submitLead.bind(null, "california", "/california");
  const trackingFields = extractTrackingParams(params);
  const metaEventId = await getMetaLeadEventId();

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
          <p className="text-sm md:text-base lg:text-xl font-semibold uppercase tracking-wide text-amber-400 mb-3 lg:mb-4 drop-shadow-sm">
            Free relocation guide · 2026 Edition
          </p>
          <h1 className={`${playfair.className} text-3xl md:text-4xl lg:text-6xl text-white leading-tight drop-shadow-sm`}>
            Get My Relocation Roadmap
          </h1>
          <p className="text-sm md:text-base lg:text-xl text-white mt-3 lg:mt-5 leading-relaxed lg:max-w-xl lg:mx-auto drop-shadow-sm">
            Reclaim your wealth and space. See how relocating to Nevada lowers your cost of living
            while elevating your lifestyle.
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
          Every month in California is another month of state income tax you won&apos;t pay in Nevada.
          The sooner you start, the sooner that savings begins, and the earlier you lock in, the
          more home and financing options you&apos;ll have.
        </p>

        <div id="lead-form" className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10">
          <LeadForm
            action={action}
            submitLabel="Get My Relocation Roadmap"
            submitted={singleParam(params.lead_submitted) === "1"}
            hiddenFields={trackingFields}
            metaEventId={metaEventId}
            large
          />
        </div>

        <RealtorBubble />

        <p className="text-center text-xs lg:text-sm text-white/70 mt-5 lg:mt-7 drop-shadow-sm">
          A Complete Tax &amp; Equity Transfer Strategy by Paulin Korensia &amp; Associates Relocation Team
        </p>
        <MinimalSiteFooter />
      </div>
    </div>
  );
}
