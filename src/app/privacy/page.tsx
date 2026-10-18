import Link from "next/link";
import { LegalPageLayout } from "@/components/LegalPageLayout";
import { BUSINESS } from "@/lib/business";

export const metadata = {
  title: "Privacy Policy · Relocation Engine",
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="June 3, 2026">
      <h2>Introduction</h2>
      <p>
        Welcome to {BUSINESS.legalName} (accessible via {BUSINESS.domain}). We respect your privacy
        and are committed to protecting your personal data. This Privacy Policy outlines how we
        collect, use, and safeguard your information when you visit our website, use our contact or
        guide-request forms, or engage with our real estate advisory services.
      </p>

      <h2>Information We Collect</h2>
      <p>
        We only collect information that you voluntarily provide to us when requesting a relocation
        guide, opting into our communications, or filling out a submission form. This may include:
      </p>
      <ul>
        <li>
          <strong>Identity Data:</strong> First name, last name.
        </li>
        <li>
          <strong>Contact Data:</strong> Email address, phone number.
        </li>
        <li>
          <strong>SMS Opt-In Data:</strong> Whether you consented to receive text messages, and the
          time you gave that consent.
        </li>
        <li>
          <strong>Usage Data:</strong> Information about how you interact with our website via
          cookies, analytics software, and reCAPTCHA security protocols.
        </li>
      </ul>

      <h2>How We Use Your Information</h2>
      <p>We use your data strictly to:</p>
      <ul>
        <li>Deliver the relocation guide(s) you requested and respond to your inquiry;</li>
        <li>Provide bespoke real estate advisory, transaction updates, marketing, and coordination services;</li>
        <li>Send you SMS/text messages if you&apos;ve opted in, per the Text Messaging section below;</li>
        <li>Ensure data security and prevent fraudulent activity on our site via reCAPTCHA verification.</li>
      </ul>

      <h2>Text Message (SMS) Communications &amp; Consent</h2>
      <p>
        If you provide your phone number and check the SMS consent box on one of our forms, you
        consent to receive recurring automated text messages from {BUSINESS.legalName} at that number,
        including relocation guide follow-ups, appointment reminders, and promotional messages about
        our services.
      </p>
      <ul>
        <li>Consent to receive text messages is not a condition of any purchase or service.</li>
        <li>Message frequency varies. Message and data rates may apply.</li>
        <li>
          Reply <strong>STOP</strong> at any time to cancel further messages, or <strong>HELP</strong>{" "}
          for assistance. You can also contact us directly at{" "}
          <a href={`mailto:${BUSINESS.email}`} className="underline hover:text-stone-900">
            {BUSINESS.email}
          </a>{" "}
          or {BUSINESS.phone}.
        </li>
        <li>Carriers are not liable for delayed or undelivered messages.</li>
        <li>
          <strong>
            No mobile information, including SMS opt-in data and consent, will be shared with any
            third parties or affiliates for marketing or promotional purposes.
          </strong>
        </li>
      </ul>
      <p>
        Full program details are available in our{" "}
        <Link href="/sms-terms" className="underline hover:text-stone-900">
          SMS Terms
        </Link>
        .
      </p>

      <h2>Sharing and Disclosure of Information</h2>
      <ul>
        <li>
          <strong>No Third-Party Sale:</strong> We do not sell, rent, trade, or distribute your
          personal information to unauthorized third-party marketers or data brokers under any
          circumstances. As noted above, SMS opt-in data is never shared for marketing purposes.
        </li>
        <li>
          <strong>Authorized Disclosures:</strong> We may share information with verified real estate
          platform vendors, transaction systems (such as SkySlope), email/SMS delivery providers
          acting on our behalf, or legal/regulatory bodies strictly as necessary to execute real
          estate compliance requirements and closing processes.
        </li>
      </ul>

      <h2>Cookies &amp; Analytics</h2>
      <p>
        Our site may use cookies and similar technologies to understand how visitors use our site and
        to secure our forms against automated abuse (reCAPTCHA). You can control cookies through your
        browser settings; disabling them may affect site functionality.
      </p>

      <h2>Security and Data Retention</h2>
      <p>
        We implement reasonable electronic safeguards and active SSL encryption (https://) to protect
        your data. Your information is retained only as long as necessary to fulfill your real estate
        requests or comply with Nevada Revised Statutes (NRS) record-keeping regulations for licensed
        professionals.
      </p>

      <h2>Your Privacy Rights &amp; Choices</h2>
      <ul>
        <li>You may request access to, correction of, or deletion of your personal data by emailing {BUSINESS.email}.</li>
        <li>You may unsubscribe from email communications at any time via the link in those emails.</li>
        <li>You may opt out of SMS communications at any time by replying STOP.</li>
        <li>
          <strong>California residents:</strong> under the California Consumer Privacy Act (CCPA/CPRA),
          you have the right to know what personal information we collect, request deletion of it, and
          opt out of its &quot;sale&quot; or &quot;sharing&quot; — which we do not do.
        </li>
        <li>
          <strong>Nevada residents:</strong> under NRS 603A, you have the right to opt out of the sale
          of certain covered information — which, again, we do not sell.
        </li>
      </ul>

      <h2>Children&apos;s Privacy</h2>
      <p>
        Our services are not directed to individuals under the age of 13, and we do not knowingly
        collect personal information from children in violation of the Children&apos;s Online Privacy
        Protection Act (COPPA).
      </p>

      <h2>Changes to This Privacy Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Changes are effective immediately upon
        posting to this page with an updated &quot;Last Updated&quot; date.
      </p>

      <h2>Contact Us</h2>
      <p>
        Questions about this Privacy Policy can be directed to{" "}
        <a href={`mailto:${BUSINESS.email}`} className="underline hover:text-stone-900">
          {BUSINESS.email}
        </a>{" "}
        or {BUSINESS.phone}.
      </p>
    </LegalPageLayout>
  );
}
