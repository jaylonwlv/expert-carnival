"use client";

import dynamic from "next/dynamic";
import type { PlacedFieldPayload } from "@/lib/signatureFields";

// pdfjs-dist is a large, canvas/window-dependent library pulled in via
// PdfPages, load it only once this editor actually mounts, instead of as
// part of the sign-setup page's initial JS bundle.
const PdfFieldEditor = dynamic(
  () => import("@/components/PdfFieldEditor").then((m) => m.PdfFieldEditor),
  {
    ssr: false,
    loading: () => <div className="h-96 rounded-lg bg-stone-50 animate-pulse" />,
  }
);

export function PdfFieldEditorLoader({
  fileUrl,
  onSend,
}: {
  fileUrl: string;
  onSend: (fields: PlacedFieldPayload[], requiresIdAcknowledgment: boolean) => Promise<void>;
}) {
  return <PdfFieldEditor fileUrl={fileUrl} onSend={onSend} />;
}
