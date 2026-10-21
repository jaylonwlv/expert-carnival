import Image from "next/image";
import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { Reveal } from "@/components/Reveal";
import { BUSINESS } from "@/lib/business";

// Same serif as the homepage's own editorial redesign, this page now
// shares that visual language rather than the plain legal-page layout it
// used before.
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600"] });

export const metadata = {
  title: "About Us · Relocation Engine",
  description: "Meet the team behind Relocation Engine LLC's California and PCS relocations to Las Vegas.",
};

const TEAM = [
  {
    name: "Jay",
    title: "Marketing Director",
    photo: "/team/jay.jpg",
    blurb:
      "Jay runs marketing and is usually the one behind the camera on location, filming the homes, neighborhoods, and behind-the-scenes moments you see across our guides and social channels.",
  },
  {
    name: "Noah",
    title: "Director of Photography",
    photo: "/team/noah.jpg",
    blurb:
      "Noah handles camera and lighting on every shoot, making sure every home and neighborhood looks as good on screen as it does in person.",
  },
  {
    name: "Daniel",
    title: "Production Editor",
    photo: "/team/daniel.jpg",
    blurb:
      "Daniel edits everything you see on our social media, turning a day of filming into the videos and guides that help you picture the move before you've made it.",
  },
];

// Shared full-width editorial row for every team member, Paulin included,
// not just her. All four headshots share the same 1333x2000 portrait crop,
// and this md:grid-cols-2 row is wider than it is tall on any normal
// screen, so object-cover alone centers the crop and cuts off the top of
// whoever's head is in the taller source image, object-top anchors the
// crop to the top instead, the same fix Paulin's row already needed.
function TeamRow({
  photo,
  name,
  title,
  blurb,
  reverse,
  extra,
}: {
  photo: string;
  name: string;
  title: string;
  blurb: string;
  reverse?: boolean;
  extra?: React.ReactNode;
}) {
  return (
    <div className="grid md:grid-cols-2">
      <div className={`relative h-[50vh] md:h-[70vh] ${reverse ? "md:order-2" : ""}`}>
        <Image
          src={photo}
          alt={name}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover object-top"
        />
      </div>
      <div className="flex items-center bg-white">
        <Reveal className="max-w-md mx-auto px-8 py-16 md:py-0">
          <p className="text-xs font-semibold text-amber-700 mb-3">{title}</p>
          <h2 className={`${playfair.className} text-2xl md:text-3xl text-stone-900 leading-snug`}>
            {name}
          </h2>
          <p className="text-sm md:text-base text-stone-600 mt-4 leading-relaxed">{blurb}</p>
          {extra}
        </Reveal>
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero: the team group photo, full-bleed, same treatment as the
          homepage's own video hero. A plain object-cover here centers its
          crop, and the photo's four people span nearly the full width
          (Noah at the far left, Jay at the far right), so on anything
          narrower than the photo's own 3:2 ratio (every phone, most
          tablets), that center crop trimmed both edges and left only
          Paulin and Daniel, the two people nearest the middle, in frame.
          Fixed with the standard mismatched-ratio technique: a blurred,
          scaled-up copy fills the section edge-to-edge with no empty
          bars, and the sharp copy on top is object-contain (never
          cropped), so all four people stay in frame at every viewport. */}
      <section className="relative min-h-[92vh] flex flex-col overflow-hidden bg-stone-900">
        <Image
          src="/team/team-group.jpg"
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          className="object-cover scale-110 blur-2xl opacity-70"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full aspect-[2000/1333]">
            <Image
              src="/team/team-group.jpg"
              alt="The Relocation Engine team"
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/10 to-black/70" />

        <header className="relative z-10">
          <div className="max-w-6xl mx-auto px-4 py-5">
            <Link
              href="/"
              className="inline-block bg-white/90 backdrop-blur-sm rounded-full pl-4 pr-5 py-2 shadow-sm"
            >
              <Image
                src="/logo.png"
                alt="Relocation Engine"
                width={680}
                height={546}
                className="h-7 w-auto"
                priority
              />
            </Link>
          </div>
        </header>

        <div className="relative z-10 flex-1 flex items-end">
          <div className="max-w-3xl mx-auto px-4 pb-16 md:pb-20 text-center w-full">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-300 mb-4">
              About us
            </p>
            <h1 className={`${playfair.className} text-4xl md:text-6xl text-white leading-tight`}>
              Full-service relocation,
              <br />
              run by people, not a call center.
            </h1>
            <p className="text-base md:text-lg text-white/85 mt-5 max-w-2xl mx-auto leading-relaxed">
              {BUSINESS.legalName} helps California sellers and military families PCSing to Nevada move
              with a plan: financing and budget confirmed up front, neighborhoods matched to what
              actually matters to you, and support all the way through touring, offers, and closing.
            </p>
          </div>
        </div>
      </section>

      <main className="flex-1">
        <section className="relative bg-stone-50 py-24 md:py-32 overflow-hidden">
          <p
            aria-hidden
            className={`${playfair.className} absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[20vw] leading-none text-stone-200/80 select-none whitespace-nowrap pointer-events-none`}
          >
            Our team
          </p>
          <Reveal className="relative max-w-2xl mx-auto px-4 text-center">
            <p className={`${playfair.className} text-2xl md:text-3xl text-stone-900 leading-snug`}>
              One realtor on the phone with you, start to finish. One team coordinating everything
              behind her.
            </p>
          </Reveal>
        </section>

        {/* Every team member gets the same full-width editorial row, not
            just Paulin, alternating sides (reverse on odd index) for the
            same visual rhythm the homepage's own EditorialRow uses. */}
        <TeamRow
          photo="/team/paulin.jpg"
          name={BUSINESS.licensee}
          title="Founder & Lead Realtor"
          blurb={`Paulin is the realtor on the team: the one who gets on the phone with you, tours neighborhoods with you, negotiates your offer, and sees your file through to closing. Every client working with ${BUSINESS.legalName} is working with her directly.`}
          extra={
            <>
              <p className="text-xs text-stone-400 mt-4">
                NV Real Estate License #{BUSINESS.nvLicense} · CA DRE #{BUSINESS.caDre}
              </p>
              <p className="text-xs text-stone-400">Brokered by {BUSINESS.brokerage}</p>
            </>
          }
        />

        <section className="bg-stone-50 py-20 md:py-24">
          <Reveal className="max-w-xl mx-auto px-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 mb-3">
              Behind the scenes
            </p>
            <h2 className={`${playfair.className} text-3xl md:text-4xl text-stone-900`}>
              The rest of the team.
            </h2>
          </Reveal>
        </section>

        {TEAM.map((member, i) => (
          <TeamRow
            key={member.name}
            photo={member.photo}
            name={member.name}
            title={member.title}
            blurb={member.blurb}
            reverse={(i + 1) % 2 === 1}
          />
        ))}

        {/* Dark CTA section, same visual language (and the same pill-button
            style) as the homepage's hero CTAs, not the plain white
            info-card buttons the Contact page uses, which is the mismatch
            this replaces. */}
        <section className="bg-stone-900 py-20 md:py-24">
          <Reveal className="max-w-xl mx-auto px-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400 mb-3">
              Get in touch
            </p>
            <h2 className={`${playfair.className} text-3xl md:text-4xl text-white`}>
              Prefer to talk it through?
            </h2>
            <p className="text-base text-white/85 mt-5 max-w-xl mx-auto leading-relaxed">
              Call or text {BUSINESS.licensee} directly. You'll always reach her, never a call
              center, never someone new starting from scratch.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                href={BUSINESS.phoneHref}
                className="rounded-full border border-white/70 text-white text-sm font-medium px-5 py-2.5 hover:bg-white hover:text-stone-900 transition"
              >
                Call {BUSINESS.phone}
              </a>
              <a
                href={BUSINESS.phoneHref.replace("tel:", "sms:")}
                className="rounded-full border border-white/70 text-white text-sm font-medium px-5 py-2.5 hover:bg-white hover:text-stone-900 transition"
              >
                Text {BUSINESS.phone}
              </a>
            </div>
          </Reveal>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
