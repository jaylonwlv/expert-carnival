import Link from "next/link";
import { LegalPageLayout } from "@/components/LegalPageLayout";
import { BUSINESS } from "@/lib/business";

export const metadata = {
  title: "Terms of Service · Relocation Engine",
};

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="October 20, 2026">
      <h2>Acceptance of Terms</h2>
      <p>
        By accessing {BUSINESS.domain}, you agree to be bound by these Terms of Service and all
        applicable state and federal laws. If you do not agree, you are prohibited from using or
        accessing this site.
      </p>

      <h2>Description of Services</h2>
      <p>
        {BUSINESS.legalName} provides real estate relocation advisory and coordination services,
        primarily for individuals and families relocating to the Las Vegas, Nevada area from
        California or via a military Permanent Change of Station (PCS). This includes informational
        guides, lead capture and follow-up communications (including SMS, governed by our{" "}
        <Link href="/sms-terms" className="underline hover:text-stone-900">
          SMS Terms
        </Link>
        ), and, for engaged clients, a private tracker used to coordinate financing, home selection,
        touring, offers, and closing.
      </p>

      <h2>No Legal or Professional Advice Disclaimer</h2>
      <p>
        The information provided on this website, including any downloadable guides, is for general
        informational and marketing purposes only. While we specialize in elite real estate logistics
        and military relocations, nothing on this site constitutes binding legal, financial, or tax
        advice. Figures such as estimated tax savings, BAH ranges, or purchasing power comparisons are
        illustrative only and will vary based on your individual circumstances. Visitors and clients
        are explicitly advised to seek counsel from independent, certified legal, tax, or financial
        professionals regarding their individual transactions, residency adjustments, or corporate
        entities.
      </p>

      <h2>Real Estate Licensing &amp; Equal Housing Opportunity</h2>
      <p>
        Real estate services referenced on this site are provided by {BUSINESS.licensee}, a licensed
        Nevada real estate professional (NV License #{BUSINESS.nvLicense}) and a licensed California
        real estate professional (CA DRE #{BUSINESS.caDre}), operating under {BUSINESS.legalName} and
        brokered by {BUSINESS.brokerage} {BUSINESS.legalName} is an Equal Opportunity company and fully supports
        the principles of the Fair Housing Act. We do not discriminate on the basis of race, color,
        religion, sex, handicap, familial status, national origin, sexual orientation, or gender
        identity in the provision of services. This site does not provide direct access to Multiple
        Listing Service (MLS) data; any listing or market information referenced is illustrative or
        general in nature.
      </p>

      <h2>User Conduct</h2>
      <p>You agree not to use this site to:</p>
      <ul>
        <li>Submit false, misleading, or fraudulent information through any form or document upload;</li>
        <li>Impersonate any person or entity, or misrepresent your affiliation with any person or entity;</li>
        <li>Upload or transmit viruses, malware, or any code intended to damage or disrupt the site;</li>
        <li>Scrape, harvest, or collect information about other users or visitors;</li>
        <li>Violate any applicable local, state, or federal law.</li>
      </ul>

      <h2>Text Messaging Program</h2>
      <p>
        If you opt in to receive SMS/text messages from us, that program is governed by our{" "}
        <Link href="/sms-terms" className="underline hover:text-stone-900">
          SMS Terms
        </Link>{" "}
        and our{" "}
        <Link href="/privacy" className="underline hover:text-stone-900">
          Privacy Policy
        </Link>
        , each incorporated into these Terms by reference.
      </p>

      <h2>Intellectual Property</h2>
      <p>
        All content on this site, including guides, text, graphics, logos, and the underlying
        software, is the property of {BUSINESS.legalName}, its parent entity{" "}
        {BUSINESS.parentEntity}, or its licensors, and is protected by applicable intellectual
        property laws. You may download guides for personal, non-commercial use only and may not
        reproduce, distribute, or create derivative works from any site content without our prior
        written consent.
      </p>

      <h2>Third-Party Links &amp; Services</h2>
      <p>
        This site may reference or link to third-party lenders, title companies, moving companies, or
        other service providers. We do not control and are not responsible for the content, accuracy,
        or practices of any third-party site or service, and referencing them does not constitute an
        endorsement.
      </p>

      <h2>Limitation of Liability</h2>
      <p>
        {BUSINESS.legalName} and its parent entity, {BUSINESS.parentEntity}, provide all website
        content on an &quot;as-is&quot; basis. We make no guarantees regarding the continuous
        availability of specific real estate listings, market conditions, or the accuracy of
        illustrative figures provided in our guides. In no event shall the company, its owners, or
        employees be liable for any damages arising out of the use or inability to use the materials
        on our platform.
      </p>

      <h2>Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless {BUSINESS.legalName}, {BUSINESS.parentEntity}, and
        their respective owners, employees, and agents from any claims, damages, or expenses
        (including reasonable attorneys&apos; fees) arising from your use of this site or your
        violation of these Terms.
      </p>

      <h2>Governing Law</h2>
      <p>
        Any legal claims, disputes, or actions relating to this website or our advisory services shall
        be governed strictly by the laws of the State of Nevada, without regard to its conflict of law
        provisions. You agree to submit to the exclusive personal jurisdiction of the courts located
        within Clark County, Nevada.
      </p>

      <h2>Changes to These Terms</h2>
      <p>
        We may update these Terms of Service from time to time. Changes are effective immediately upon
        posting to this page with an updated &quot;Last Updated&quot; date. Your continued use of the
        site after changes are posted constitutes acceptance of the revised Terms.
      </p>

      <h2>Severability &amp; Entire Agreement</h2>
      <p>
        If any provision of these Terms is found unenforceable, the remaining provisions will remain
        in full effect. These Terms, together with our Privacy Policy and SMS Terms, constitute the
        entire agreement between you and {BUSINESS.legalName} regarding use of this site.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these Terms can be directed to{" "}
        <a href={`mailto:${BUSINESS.email}`} className="underline hover:text-stone-900">
          {BUSINESS.email}
        </a>{" "}
        or {BUSINESS.phone}.
      </p>
    </LegalPageLayout>
  );
}
