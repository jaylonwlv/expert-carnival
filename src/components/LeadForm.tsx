import Link from "next/link";
import { SubmitButton } from "@/components/SubmitButton";

export function LeadForm({
  action,
  submitLabel,
  submitted,
  error,
}: {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  submitted?: boolean;
  error?: string;
}) {
  if (submitted) {
    return (
      <div className="rounded-xl bg-green-50 border border-green-200 px-5 py-8 text-center">
        <p className="text-sm font-semibold text-green-800">You&apos;re all set!</p>
        <p className="text-sm text-green-700 mt-1">
          Check your email for your guide — we&apos;ll be in touch soon.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error === "invalid_email" ? "Please enter a valid email address." : "Please fill in all fields."}
        </p>
      )}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1">
          Your full name
        </label>
        <input
          id="name"
          name="name"
          required
          className="w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
        />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-stone-700 mb-1">
          Your phone number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          className="w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1">
          Your email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
        />
      </div>
      <label className="flex items-start gap-2.5 text-xs text-stone-500 leading-relaxed">
        <input type="checkbox" name="smsConsent" className="mt-0.5 rounded border-stone-300" />
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
      <SubmitButton
        pendingText="Submitting…"
        className="w-full rounded-md bg-amber-600 text-white text-sm font-semibold py-3 shadow-sm hover:shadow-md hover:bg-amber-700 transition"
      >
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
