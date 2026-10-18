import { LegalPageLayout } from "@/components/LegalPageLayout";
import { BUSINESS } from "@/lib/business";

export const metadata = {
  title: "Accessibility Statement · Relocation Engine",
};

export default function AccessibilityPage() {
  return (
    <LegalPageLayout title="Accessibility Statement" lastUpdated="June 3, 2026">
      <h2>Our Commitment</h2>
      <p>
        {BUSINESS.legalName} is dedicated to ensuring digital accessibility for all visitors,
        including individuals with disabilities. We continually review and improve our web platform
        user experience to align with relevant accessibility standards, including the Web Content
        Accessibility Guidelines (WCAG) 2.1 Level AA.
      </p>

      <h2>Ongoing Efforts</h2>
      <p>
        We periodically review our site&apos;s structure, color contrast, and form labeling, and we
        welcome feedback from visitors using assistive technology. Some third-party content embedded
        on our site (such as maps or analytics widgets) may not fully conform to these guidelines; we
        work with vendors to improve this where possible.
      </p>

      <h2>Assistance &amp; Contact Information</h2>
      <p>
        If you experience any difficulty accessing our content, reviewing property parameters, or
        using our forms, please contact our team directly at{" "}
        <a href={`mailto:${BUSINESS.accessibilityEmail}`} className="underline hover:text-stone-900">
          {BUSINESS.accessibilityEmail}
        </a>
        . We will happily accommodate your request and provide the information through accessible
        traditional formats.
      </p>
    </LegalPageLayout>
  );
}
