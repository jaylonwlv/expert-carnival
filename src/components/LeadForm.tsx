"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { SubmitButton } from "@/components/SubmitButton";
import { TrackerPreview } from "@/components/TrackerPreview";
import { MetaLeadPixelFire } from "@/components/MetaLeadPixelFire";
import type { LeadFormState } from "@/app/lead-actions";

export function LeadForm({
  action,
  submitLabel,
  submitted,
  large,
  hiddenFields,
  metaEventId,
}: {
  action: (prevState: LeadFormState, formData: FormData) => Promise<LeadFormState>;
  submitLabel: string;
  submitted?: boolean;
  large?: boolean;
  // UTM params + fbclid, read server-side from the landing page's own
  // query string and passed straight through as hidden fields — simpler
  // than a cookie for a single self-contained page with no navigation
  // before the form, and avoids any cookie-consent question entirely.
  hiddenFields?: Record<string, string>;
  // Set only once the visitor has actually converted (the redirect target
  // carries it) — see app/lead-actions.ts.
  metaEventId?: string;
}) {
  // A validation error now comes back as state on this same render, not a
  // redirect to a fresh page load — so a visitor who scrolled down, filled
  // the form in, and mistyped their email doesn't lose that scroll position
  // or get an empty form back. Success still redirects via `submitted`
  // (the one path where there's nothing left to preserve).
  const [state, formAction] = useActionState(action, {});

  // The homepage's form sits ~5700px down the page; the redirect this
  // page just took after a real submission resets scroll to the very top,
  // so without this, a visitor who just submitted sees the hero again with
  // zero sign anything happened — confirmed directly (not assumed) to
  // read as a silent failure, risking a duplicate submission or an
  // abandoned visitor who thinks the form is broken.
  const successRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (submitted) successRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    // Only on mount — this page load IS the one that just submitted, so
    // there's no later change in `submitted` to react to.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (submitted) {
    return (
      <div ref={successRef} className="space-y-4 scroll-mt-20">
        <div className={`rounded-xl bg-green-50 border border-green-200 px-5 py-8 text-center ${large ? "lg:px-7 lg:py-10" : ""}`}>
          <p className={`text-sm font-semibold text-green-800 ${large ? "lg:text-base" : ""}`}>You&apos;re all set!</p>
          <p className={`text-sm text-green-700 mt-1 ${large ? "lg:text-base" : ""}`}>
            Check your email now: your guide is on its way, and we&apos;ll be in touch soon.
          </p>
        </div>
        <TrackerPreview />
        {metaEventId && <MetaLeadPixelFire eventId={metaEventId} />}
      </div>
    );
  }

  return (
    <form
      key={JSON.stringify(state)}
      action={formAction}
      className={`space-y-4 ${large ? "lg:space-y-5" : ""}`}
    >
      {hiddenFields &&
        Object.entries(hiddenFields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
      {state.error && (
        <p className={`text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 ${large ? "lg:text-base" : ""}`}>
          {state.error === "invalid_email"
            ? "Please enter a valid email address."
            : state.error === "db_unavailable"
              ? "We couldn't save that just now. Please try again in a moment."
              : "Please fill in all fields."}
        </p>
      )}
      <div>
        <label htmlFor="name" className={`block text-sm font-medium text-stone-700 mb-1 ${large ? "lg:text-base" : ""}`}>
          Your full name
        </label>
        <input
          id="name"
          name="name"
          required
          autoComplete="name"
          autoCapitalize="words"
          defaultValue={state.values?.name}
          className={`w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600 ${large ? "lg:px-4 lg:py-3 lg:text-base" : ""}`}
        />
      </div>
      <div>
        <label htmlFor="phone" className={`block text-sm font-medium text-stone-700 mb-1 ${large ? "lg:text-base" : ""}`}>
          Your phone number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          defaultValue={state.values?.phone}
          className={`w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600 ${large ? "lg:px-4 lg:py-3 lg:text-base" : ""}`}
        />
      </div>
      <div>
        <label htmlFor="email" className={`block text-sm font-medium text-stone-700 mb-1 ${large ? "lg:text-base" : ""}`}>
          Your email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={state.values?.email}
          className={`w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600 ${large ? "lg:px-4 lg:py-3 lg:text-base" : ""}`}
        />
      </div>
      <label className={`flex items-start gap-2.5 text-xs text-stone-500 leading-relaxed ${large ? "lg:text-sm" : ""}`}>
        <input
          type="checkbox"
          name="smsConsent"
          defaultChecked={state.values?.smsConsent}
          className="mt-0.5 rounded border-stone-300"
        />
        <span>
          Yes, I would like to receive automated text messages from Relocation Engine LLC at the phone
          number provided above. Consent is not a condition of purchase. Message and data rates may
          apply. Message frequency varies. Reply STOP to opt out, HELP for help. See our{" "}
          <Link href="/sms-terms" className="underline hover:text-stone-700">
            SMS Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-stone-700">
            Privacy Policy
          </Link>
          .
        </span>
      </label>
      {/* Honeypot — off-screen and unreachable by Tab, so no real visitor
          ever sees or fills it; a generically-named field like "company"
          is exactly the kind an automated form-filler tends to fill in
          regardless. See the matching check in lead-actions.ts. Placed
          last (not first) so it can't be mistaken by a browser's autofill
          heuristics for the form's primary subject, ahead of the actual
          name/phone/email fields. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute w-px h-px opacity-0 -left-[9999px]"
      />
      <SubmitButton
        pendingText="Submitting…"
        className={`w-full rounded-md bg-amber-600 text-white text-sm font-semibold py-3 shadow-sm hover:shadow-md hover:bg-amber-700 transition ${large ? "lg:text-base lg:py-3.5" : ""}`}
      >
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
