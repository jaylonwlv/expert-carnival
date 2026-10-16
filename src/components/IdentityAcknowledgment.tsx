"use client";

import { useState } from "react";

export function IdentityAcknowledgment({
  documentFilename,
  onAcknowledge,
}: {
  documentFilename: string;
  onAcknowledge: () => Promise<void>;
}) {
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleContinue() {
    if (!checked) return;
    setSubmitting(true);
    setError(null);
    try {
      await onAcknowledge();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-4">
      <div>
        <p className="text-sm font-semibold text-stone-900">Before you continue</p>
        <p className="text-sm text-stone-500 mt-1">
          Please confirm the following before viewing and signing &ldquo;{documentFilename}&rdquo;.
        </p>
      </div>
      <label className="flex items-start gap-2 text-sm text-stone-700 bg-stone-50 border border-stone-200 rounded-lg p-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-0.5 rounded"
        />
        The full name and information I am about to provide matches the name on my valid, unexpired
        government-issued photo ID (driver&apos;s license, state ID, passport, or military ID).
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="button"
        onClick={handleContinue}
        disabled={!checked || submitting}
        className="w-full rounded-md bg-amber-600 text-white text-sm font-medium py-2.5 shadow-sm hover:shadow-md hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Continuing…" : "Continue to document"}
      </button>
    </div>
  );
}
