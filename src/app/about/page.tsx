import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { BUSINESS } from "@/lib/business";

export const metadata = {
  title: "About Us · Relocation Engine",
  description: "Meet the team behind Relocation Engine LLC's California and PCS relocations to Las Vegas.",
};

const TEAM = [
  {
    name: "Jay",
    title: "Marketing Director",
    photo: "/team/jay.jpg",
    blurb: "Runs the campaigns, lead-magnet guides, and digital presence that bring new clients in the door.",
  },
  {
    name: "Noah",
    title: "Operations Director",
    photo: "/team/noah.jpg",
    blurb: "Keeps the moving pieces (financing, scheduling, document flow) coordinated from lead to closing.",
  },
  {
    name: "Daniel",
    title: "Production Editor",
    photo: "/team/daniel.jpg",
    blurb: "Produces the relocation guides and client-facing materials that make the move easier to plan.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <Link href="/" className="inline-block">
            <Image src="/logo.png" alt="Relocation Engine" width={680} height={546} className="h-14 w-auto" priority />
          </Link>
        </div>
      </header>

      <main className="flex-1 bg-[#faf8f4]">
        <section className="max-w-3xl mx-auto px-4 pt-16 pb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-3">About us</p>
          <h1 className="text-3xl md:text-4xl font-bold text-stone-900 leading-tight">
            Full-service relocation, run by people, not a form.
          </h1>
          <p className="text-base text-stone-600 mt-5 leading-relaxed">
            {BUSINESS.legalName} helps California sellers and military families PCSing to Nevada move
            with a plan: financing and budget confirmed up front, neighborhoods matched to what
            actually matters to you, and support all the way through touring, offers, and closing.
            Every client gets a private tracker so you always know exactly where things stand.
          </p>
        </section>

        {/* Paulin gets the featured, full-width treatment -- she's the one
            clients actually talk to and who closes the transaction. */}
        <section className="max-w-3xl mx-auto px-4 pb-6">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden md:flex">
            <div className="md:w-2/5 shrink-0">
              <Image
                src="/team/paulin.jpg"
                alt="Paulin Korensia"
                width={1333}
                height={2000}
                className="w-full h-64 md:h-full object-cover"
                priority
              />
            </div>
            <div className="p-6 md:p-8 flex flex-col justify-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-2">
                Founder &amp; Lead Realtor
              </p>
              <h2 className="text-2xl font-bold text-stone-900">{BUSINESS.licensee}</h2>
              <p className="text-sm text-stone-600 mt-3 leading-relaxed">
                Paulin is the realtor on the team: the one who gets on the phone with you, walks
                neighborhoods, negotiates your offer, and sees your file through to closing. Every
                client working with {BUSINESS.legalName} is working with her directly.
              </p>
              <p className="text-xs text-stone-400 mt-4">NV Real Estate License #{BUSINESS.nvLicense}</p>
            </div>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 pb-16">
          <div className="grid sm:grid-cols-3 gap-5">
            {TEAM.map((member) => (
              <div key={member.name} className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                <Image
                  src={member.photo}
                  alt={member.name}
                  width={1333}
                  height={2000}
                  className="w-full h-56 object-cover"
                />
                <div className="p-4">
                  <p className="text-sm font-semibold text-stone-900">{member.name}</p>
                  <p className="text-xs font-medium text-amber-700 mt-0.5">{member.title}</p>
                  <p className="text-xs text-stone-500 mt-2 leading-relaxed">{member.blurb}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
