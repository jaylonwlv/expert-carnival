import Link from "next/link";
import { LegalPageLayout } from "@/components/LegalPageLayout";
import { BUSINESS } from "@/lib/business";

export const metadata = {
  title: "SMS Terms · Relocation Engine",
};

export default function SmsTermsPage() {
  return (
    <LegalPageLayout title="SMS Terms & Conditions" lastUpdated="June 3, 2026">
      <h2>Program Description</h2>
      <p>
        The {BUSINESS.legalName} text messaging program sends relocation guide delivery confirmations,
        follow-up and appointment reminders, and promotional messages about our relocation advisory
        services to subscribers who opt in through our website forms.
      </p>

      <h2>How to Join</h2>
      <p>
        You join by submitting your phone number and checking the SMS consent checkbox on one of our
        website forms (for example, when requesting a relocation guide). By doing so, you consent to
        receive recurring automated text messages from us at that number. Consent to receive text
        messages is not a condition of any purchase or service.
      </p>

      <h2>Message Frequency &amp; Cost</h2>
      <p>
        Message frequency varies based on your relocation timeline and how we&apos;re working
        together. Message and data rates may apply, as determined by your mobile carrier and plan.
      </p>

      <h2>How to Opt Out</h2>
      <p>
        Reply <strong>STOP</strong> to any message at any time to cancel. You will receive a one-time
        confirmation that you have been unsubscribed, and no further messages will be sent unless you
        opt in again.
      </p>

      <h2>Help</h2>
      <p>
        Reply <strong>HELP</strong> to any message for assistance, or contact us directly at{" "}
        <a href={`mailto:${BUSINESS.email}`} className="underline hover:text-stone-900">
          {BUSINESS.email}
        </a>{" "}
        or {BUSINESS.phone}.
      </p>

      <h2>Supported Carriers</h2>
      <p>
        Major U.S. wireless carriers are supported. Carriers are not liable for delayed or undelivered
        messages. Carrier coverage may vary.
      </p>

      <h2>Privacy</h2>
      <p>
        Your phone number and SMS opt-in status are handled per our{" "}
        <Link href="/privacy" className="underline hover:text-stone-900">
          Privacy Policy
        </Link>
        . No mobile information, including opt-in data and consent, is shared with any third parties
        or affiliates for marketing or promotional purposes.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this program can be directed to{" "}
        <a href={`mailto:${BUSINESS.email}`} className="underline hover:text-stone-900">
          {BUSINESS.email}
        </a>{" "}
        or {BUSINESS.phone}.
      </p>
    </LegalPageLayout>
  );
}
