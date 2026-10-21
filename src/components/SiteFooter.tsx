import Link from "next/link";
import { BUSINESS } from "@/lib/business";
import { SocialLinks } from "@/components/SocialLinks";

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/sms-terms", label: "SMS Terms" },
  { href: "/accessibility", label: "Accessibility" },
];

// Full site footer -- nav to About/Contact, the legal pages required by the
// SMS/real-estate compliance work, and the Equal Housing Opportunity
// statement. Used on the homepage and every informational/legal page.
// `socialLinks` is opt-in (default off) -- only the homepage passes it;
// the legal pages and the dedicated lead-capture pages intentionally don't,
// same reasoning MinimalSiteFooter already documents for those.
export function SiteFooter({ socialLinks = false }: { socialLinks?: boolean } = {}) {
  return (
    <footer className="border-t border-stone-200 bg-[#faf8f4]">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex flex-wrap justify-between gap-8">
          <div className="max-w-sm">
            <p className="text-sm font-semibold text-stone-900">{BUSINESS.legalName}</p>
            <p className="text-sm text-stone-500 mt-1">
              <a href={BUSINESS.phoneHref} className="hover:text-stone-700">
                {BUSINESS.phone}
              </a>
              {" · "}
              <a href={`mailto:${BUSINESS.email}`} className="hover:text-stone-700">
                {BUSINESS.email}
              </a>
            </p>
            <p className="text-xs text-stone-400 mt-2">
              {BUSINESS.licensee} · NV Real Estate License #{BUSINESS.nvLicense}
            </p>
            <p className="text-xs text-stone-400">
              Brokered by {BUSINESS.brokerage} · CA DRE #{BUSINESS.caDre}
            </p>
            {socialLinks && (
              <div className="mt-4">
                <SocialLinks />
              </div>
            )}
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <div className="space-y-2">
              <p className="font-semibold text-stone-900">Company</p>
              <Link href="/about" className="block text-stone-500 hover:text-stone-800">
                About
              </Link>
              <Link href="/contact" className="block text-stone-500 hover:text-stone-800">
                Contact
              </Link>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-stone-900">Legal</p>
              {LEGAL_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="block text-stone-500 hover:text-stone-800">
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-stone-400">
            {BUSINESS.legalName} is an Equal Opportunity company and fully supports the principles of
            the Fair Housing Act. We do not discriminate on the basis of race, color, religion, sex,
            disability, familial status, national origin, sexual orientation, or gender identity, per
            the State of California and Nevada law &amp; jurisdictions.
          </p>
          <p className="text-xs text-stone-400 shrink-0">⌂ Equal Housing Opportunity</p>
        </div>

        <p className="text-xs text-stone-400 mt-4">
          © {new Date().getFullYear()} {BUSINESS.legalName}. All rights reserved.
          {" · "}
          <Link href="/admin" className="hover:text-stone-600">
            Agent login
          </Link>
        </p>
      </div>
    </footer>
  );
}

// Compact version for the dedicated lead-capture pages (/california,
// /optin), where a full nav footer would compete with the single
// conversion goal -- just the links that compliance actually needs
// reachable from a page that collects SMS consent, plus a tap-to-call
// fallback. The form is the primary path, so the call link is deliberately
// below everything else, not competing for attention above the fold -- but
// some visitors who are already sold just want to talk to Paulin directly
// rather than type into a form, and until now that path didn't exist
// anywhere on either page.
export function MinimalSiteFooter() {
  return (
    <div className="text-center mt-3">
      <p className="text-xs text-white/70">
        Prefer to talk now?{" "}
        <a href={BUSINESS.phoneHref} className="underline hover:text-white font-medium">
          Call {BUSINESS.phone}
        </a>
      </p>
      <p className="text-xs text-white/60 mt-2">
        <Link href="/privacy" className="underline hover:text-white">
          Privacy Policy
        </Link>
        {" · "}
        <Link href="/terms" className="underline hover:text-white">
          Terms
        </Link>
        {" · "}
        <Link href="/sms-terms" className="underline hover:text-white">
          SMS Terms
        </Link>
      </p>
    </div>
  );
}
