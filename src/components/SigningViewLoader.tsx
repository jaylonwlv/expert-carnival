"use client";

import dynamic from "next/dynamic";
import type { SigningField } from "@/components/SigningView";

// Same rationale as PdfFieldEditorLoader: keep pdfjs-dist out of the signing
// page's initial bundle until the viewer itself actually mounts.
const SigningView = dynamic(
  () => import("@/components/SigningView").then((m) => m.SigningView),
  {
    ssr: false,
    loading: () => <div className="h-96 rounded-lg bg-stone-50 animate-pulse" />,
  }
);

export function SigningViewLoader({
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
  return (
    <SigningView
      fileUrl={fileUrl}
      fields={fields}
      defaultSignerName={defaultSignerName}
      onSubmit={onSubmit}
    />
  );
}
