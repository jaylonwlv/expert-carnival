"use client";

import { useState } from "react";
import Link from "next/link";
import { DocumentUploadForm } from "@/components/DocumentUploadForm";
import type { UploadAuthContext, UploadedBlobMeta } from "@/lib/documents";

export function QuickUploadBar({
  context,
  documentsHref,
  stageOptions,
  signerOptions,
  uploadAction,
}: {
  context: UploadAuthContext;
  documentsHref: string;
  stageOptions: { index: number; title: string }[];
  signerOptions: { id: string; name: string }[];
  uploadAction: (
    stageIndex: number | null,
    signerId: string | null,
    blobs: UploadedBlobMeta[],
    visibleToClient: boolean
  ) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  return (
    <section className="bg-white rounded-xl border border-stone-200 shadow-sm">
      <div className="flex items-stretch divide-x divide-stone-200">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          disabled={uploading}
          title={uploading ? "Upload in progress…" : undefined}
          className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-l-xl px-4 py-3.5 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a.75.75 0 01.75.75v8.69l2.47-2.47a.75.75 0 111.06 1.06l-3.75 3.75a.75.75 0 01-1.06 0L5.72 10.03a.75.75 0 111.06-1.06l2.47 2.47V2.75A.75.75 0 0110 2z" />
            <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
          </svg>
          {uploading ? "Uploading…" : open ? "Close" : "Upload files"}
        </button>
        <Link
          href={documentsHref}
          aria-disabled={uploading}
          title={uploading ? "Upload in progress…" : undefined}
          onClick={(e) => {
            if (uploading) e.preventDefault();
          }}
          className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium text-stone-800 rounded-r-xl px-4 py-3.5 transition ${
            uploading ? "opacity-60 cursor-not-allowed" : "hover:bg-stone-50"
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h5.172a2 2 0 011.414.586l2.828 2.828A2 2 0 0116 6.828V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 7a1 1 0 100 2h6a1 1 0 100-2H7zm0 4a1 1 0 100 2h6a1 1 0 100-2H7z"
              clipRule="evenodd"
            />
          </svg>
          View client documents
        </Link>
      </div>

      {open && (
        <div className="p-5 pt-4 border-t border-stone-200">
          <DocumentUploadForm
            context={context}
            onUploadWithStageAndSigner={async (stageIndex, signerId, blobs, visibleToClient) => {
              await uploadAction(stageIndex, signerId, blobs, visibleToClient);
              setOpen(false);
            }}
            onUploadingChange={setUploading}
            stageOptions={stageOptions}
            signerOptions={signerOptions}
            showVisibilityToggle
            className="space-y-3"
          />
        </div>
      )}
    </section>
  );
}
