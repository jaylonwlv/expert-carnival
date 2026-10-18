import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { BUSINESS } from "@/lib/business";

export const metadata = {
  title: "Contact Us · Relocation Engine",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <Link href="/" className="inline-block">
            <Image src="/logo.png" alt="Relocation Engine" width={680} height={546} className="h-9 w-auto" priority />
          </Link>
        </div>
      </header>

      <main className="flex-1 bg-[#faf8f4]">
        <section className="max-w-3xl mx-auto px-4 pt-16 pb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-3">Get in touch</p>
          <h1 className="text-3xl md:text-4xl font-bold text-stone-900 leading-tight">
            We&apos;d love to hear from you.
          </h1>
          <p className="text-base text-stone-600 mt-5 leading-relaxed">
            Whether you&apos;re moving from California or PCSing to Las Vegas, reach out directly —
            or start with one of our free relocation guides below.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-4 pb-10">
          <Image
            src="/team/team-group.jpg"
            alt="The Relocation Engine team"
            width={2000}
            height={1333}
            className="w-full rounded-2xl shadow-sm object-cover"
            priority
          />
        </section>

        <section className="max-w-3xl mx-auto px-4 pb-10">
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-2">Call or text</p>
              <a href={BUSINESS.phoneHref} className="text-lg font-semibold text-stone-900 hover:text-amber-700">
                {BUSINESS.phone}
              </a>
            </div>
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-2">Email</p>
              <a href={`mailto:${BUSINESS.email}`} className="text-lg font-semibold text-stone-900 hover:text-amber-700">
                {BUSINESS.email}
              </a>
            </div>
          </div>
          <p className="text-xs text-stone-400 mt-5 text-center">
            {BUSINESS.licensee} · NV Real Estate License #{BUSINESS.nvLicense}
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-4 pb-16 text-center">
          <p className="text-sm text-stone-500 mb-4">Not ready to call? Start here instead:</p>
          <div className="flex flex-wrap justify-center gap-3">
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
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
