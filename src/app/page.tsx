import Image from "next/image";
import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import { LeadForm } from "@/components/LeadForm";
import { SiteFooter } from "@/components/SiteFooter";
import { TaxSavingsCalculator } from "@/components/TaxSavingsCalculator";
import { BRollVideo } from "@/components/BRollVideo";
import { Reveal } from "@/components/Reveal";
import { StickyCtaBar } from "@/components/StickyCtaBar";
import { extractTrackingParams, singleParam } from "@/lib/utm";
import { getMetaLeadEventId } from "@/lib/meta";
import { submitLead } from "./lead-actions";

// Scoped to this page only, the display serif is part of the homepage's
// editorial redesign, not a site-wide type change.
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600"] });

export const metadata = {
  title: "Relocation Engine · Relocate to Las Vegas",
  description:
    "Full-service relocation to Las Vegas, from financing and home selection through closing and move-in.",
};

// Paulin's own b-roll, not stock footage, one clip per service so each
// gets its own full-bleed moment instead of sharing a single hero loop.
const SERVICES = [
  {
    title: "Financing & budget",
    body: "We work with your lender to confirm your pre-approval and total moving budget before you ever look at a listing.",
    videoSrc: "/broll/pool.mp4",
    poster: "/broll/pool-poster.jpg",
  },
  {
    title: "Home & area selection",
    body: "Curated listings and neighborhood breakdowns based on your must-haves, not generic search results.",
    videoSrc: "/broll/patio.mp4",
    poster: "/broll/patio-poster.jpg",
  },
  {
    title: "Touring, offers & closing",
    body: "From scheduling tours to negotiating your offer to the final walkthrough, we're with you at every step.",
    videoSrc: "/broll/staircase.mp4",
    poster: "/broll/staircase-poster.jpg",
  },
  {
    title: "A tracker just for you",
    body: "Once you're signed on, you get a private link that always shows exactly where your move stands.",
    videoSrc: "/broll/interior-water.mp4",
    poster: "/broll/interior-water-poster.jpg",
  },
];

function EditorialRow({
  index,
  title,
  body,
  videoSrc,
  poster,
  reverse,
}: {
  index: string;
  title: string;
  body: string;
  videoSrc: string;
  poster: string;
  reverse?: boolean;
}) {
  return (
    <div className="grid md:grid-cols-2">
      <div className={`relative h-[50vh] md:h-[70vh] ${reverse ? "md:order-2" : ""}`}>
        <BRollVideo src={videoSrc} poster={poster} />
      </div>
      <div className="flex items-center bg-white">
        <Reveal className="max-w-md mx-auto px-8 py-16 md:py-0">
          <p className="text-xs font-semibold text-amber-700 mb-3">{index}</p>
          <h3 className={`${playfair.className} text-2xl md:text-3xl text-stone-900 leading-snug`}>
            {title}
          </h3>
          <p className="text-sm md:text-base text-stone-600 mt-4 leading-relaxed">{body}</p>
        </Reveal>
      </div>
    </div>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const action = submitLead.bind(null, "homepage", "/");
  const trackingFields = extractTrackingParams(params);
  const metaEventId = await getMetaLeadEventId();

  return (
    <div className="min-h-screen flex flex-col">
      {/* This page is by far the longest, most scroll-heavy one on the
          site (hero -> quote -> 4 video sections -> calculator -> the one
          form, dead last), /california and /optin already get this
          floating shortcut, but it was never wired up here despite needing
          it the most. */}
      <StickyCtaBar heroId="hero" formId="lead-form" label="Get My Free Guide ↓" />

      <section id="hero" className="relative min-h-[92vh] flex flex-col overflow-hidden bg-stone-900">
        <BRollVideo src="/broll/hero-glass.mp4" poster="/broll/hero-glass-poster.jpg" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/10 to-black/70" />

        <header className="relative z-10">
          <div className="max-w-6xl mx-auto px-4 py-5">
            <div className="inline-block bg-white/90 backdrop-blur-sm rounded-full pl-4 pr-5 py-2 shadow-sm">
              <Image
                src="/logo.png"
                alt="Relocation Engine"
                width={680}
                height={546}
                className="h-7 w-auto"
                priority
              />
            </div>
          </div>
        </header>

        <div className="relative z-10 flex-1 flex items-end">
          <div className="max-w-3xl mx-auto px-4 pb-16 md:pb-20 text-center w-full">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-300 mb-4">
              California &amp; Military Relocation Specialists
            </p>
            <h1 className={`${playfair.className} text-4xl md:text-6xl text-white leading-tight`}>
              Relocating to Las Vegas?
              <br />
              We&apos;ll handle everything.
            </h1>
            <p className="text-base md:text-lg text-white/85 mt-5 max-w-2xl mx-auto leading-relaxed">
              Full-service relocation support, from financing and home selection through closing and
              move-in, for California sellers and military PCS moves alike.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/california"
                className="rounded-full border border-white/70 text-white text-sm font-medium px-5 py-2.5 hover:bg-white hover:text-stone-900 transition"
              >
                Moving from California?
              </Link>
              <Link
                href="/optin"
                className="rounded-full border border-white/70 text-white text-sm font-medium px-5 py-2.5 hover:bg-white hover:text-stone-900 transition"
              >
                PCS orders to Las Vegas?
              </Link>
            </div>
            {/* Neither bucket? Without this, the only way down to the
                generic form is scrolling the entire page, a plain anchor
                jump (not a route change) straight to it. */}
            <a
              href="#lead-form"
              className="inline-block mt-4 text-sm text-white/70 underline underline-offset-2 hover:text-white transition"
            >
              Not sure yet? Get the free guide anyway ↓
            </a>
          </div>
        </div>
      </section>

      <main className="flex-1">
        <section className="relative bg-stone-50 py-24 md:py-32 overflow-hidden">
          <p
            aria-hidden
            className={`${playfair.className} absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[20vw] leading-none text-stone-200/80 select-none whitespace-nowrap pointer-events-none`}
          >
            Las Vegas
          </p>
          <Reveal className="relative max-w-2xl mx-auto px-4 text-center">
            <p className={`${playfair.className} text-2xl md:text-3xl text-stone-900 leading-snug`}>
              A new chapter, without the guesswork: the financing, the search, and everything
              after the keys, handled by one team.
            </p>
          </Reveal>
        </section>

        {SERVICES.map((service, i) => (
          <EditorialRow
            key={service.title}
            index={`0${i + 1}`}
            title={service.title}
            body={service.body}
            videoSrc={service.videoSrc}
            poster={service.poster}
            reverse={i % 2 === 1}
          />
        ))}

        <section className="bg-stone-900 py-20 md:py-24">
          <Reveal className="max-w-xl mx-auto px-4 text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400 mb-3">
              Get started
            </p>
            <h2 className={`${playfair.className} text-3xl md:text-4xl text-white`}>
              See what the move actually saves you.
            </h2>
          </Reveal>
          <div className="max-w-xl mx-auto px-4 space-y-5">
            <TaxSavingsCalculator page="homepage" />

            <div id="lead-form" className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 scroll-mt-20">
              <h3 className="text-lg font-semibold text-stone-900 text-center">
                Get your free California to Las Vegas relocation guide
              </h3>
              <p className="text-sm text-stone-500 text-center mt-1 mb-6">
                Tell us a bit about yourself and we&apos;ll send it right over.
              </p>
              <LeadForm
                action={action}
                submitLabel="Get My Free Guide"
                submitted={singleParam(params.lead_submitted) === "1"}
                hiddenFields={trackingFields}
                metaEventId={metaEventId}
              />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter socialLinks />
    </div>
  );
}
