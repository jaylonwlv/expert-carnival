"use client";

import { useState } from "react";
import { PdfPages } from "@/components/PdfPages";
import { SignaturePad } from "@/components/SignaturePad";
import type { SignatureFieldType } from "@/lib/signature";

export type SigningField = {
  id: string;
  type: SignatureFieldType;
  page: number;
  xPct: number;
  yPct: number;
  widthPct: number;
  heightPct: number;
  label: string | null;
};

function todayFormatted(): string {
  return new Date().toLocaleDateString("en-US");
}

export function SigningView({
  fileUrl,
  fields,
  defaultSignerName,
  onSubmit,
}: {
  fileUrl: string;
  fields: SigningField[];
  defaultSignerName: string;
  onSubmit: (values: Record<string, string>, signerName: string) => Promise<void>;
}) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const field of fields) {
      if (field.type === "date") initial[field.id] = todayFormatted();
      if (field.type === "checkbox") initial[field.id] = "false";
    }
    return initial;
  });
  const [padFor, setPadFor] = useState<SigningField | null>(null);
  const [signerName, setSignerName] = useState(defaultSignerName);
  const [consented, setConsented] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setValue(fieldId: string, value: string) {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  }

  const requiredUnfilled = fields.filter(
    (f) => f.type !== "checkbox" && !(values[f.id] && values[f.id].trim() !== "")
  );
  const canSubmit = requiredUnfilled.length === 0 && consented && signerName.trim() !== "" && !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(values, signerName.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong submitting your signature.");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      {padFor && (
        <SignaturePad
          title={padFor.type === "initials" ? "Add your initials" : "Add your signature"}
          onConfirm={(dataUrl) => {
            setValue(padFor.id, dataUrl);
            setPadFor(null);
          }}
          onCancel={() => setPadFor(null)}
        />
      )}

      <PdfPages
        fileUrl={fileUrl}
        renderOverlay={(pageIndex, size) =>
          fields
            .filter((f) => f.page === pageIndex)
            .map((field) => {
              const style = {
                left: field.xPct * size.width,
                top: field.yPct * size.height,
                width: field.widthPct * size.width,
                height: field.heightPct * size.height,
              };
              const value = values[field.id];

              if (field.type === "signature" || field.type === "initials") {
                return (
                  <button
                    key={field.id}
                    type="button"
                    onClick={() => setPadFor(field)}
                    className="absolute border-2 border-dashed rounded flex items-center justify-center overflow-hidden transition border-amber-500 bg-amber-50/70 hover:bg-amber-100"
                    style={style}
                  >
                    {value ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={value} alt="" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-xs font-medium text-amber-700">
                        Click to {field.type === "initials" ? "initial" : "sign"}
                      </span>
                    )}
                  </button>
                );
              }

              if (field.type === "checkbox") {
                return (
                  <input
                    key={field.id}
                    type="checkbox"
                    checked={value === "true"}
                    onChange={(e) => setValue(field.id, e.target.checked ? "true" : "false")}
                    className="absolute"
                    style={style}
                  />
                );
              }

              return (
                <input
                  key={field.id}
                  type="text"
                  value={value ?? ""}
                  onChange={(e) => setValue(field.id, e.target.value)}
                  placeholder={field.label ?? (field.type === "date" ? "Date" : "Text")}
                  className="absolute border border-neutral-400 bg-white text-sm px-1 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  style={style}
                />
              );
            })
        }
      />

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 space-y-3">
        <div>
          <label htmlFor="signerName" className="block text-sm font-medium text-neutral-700 mb-1">
            Your full name
          </label>
          <input
            id="signerName"
            type="text"
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>
        <label className="flex items-start gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={consented}
            onChange={(e) => setConsented(e.target.checked)}
            className="mt-0.5 rounded"
          />
          I agree that my electronic signature on this document is legally binding, just as a handwritten
          signature would be.
        </label>
        {requiredUnfilled.length > 0 && (
          <p className="text-sm text-neutral-500">{requiredUnfilled.length} field(s) still need to be filled in.</p>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full rounded-md bg-neutral-900 text-white text-sm font-medium py-2.5 shadow-sm hover:shadow-md hover:bg-neutral-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting…" : "Submit signature"}
        </button>
      </div>
    </div>
  );
}
