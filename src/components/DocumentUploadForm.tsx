"use client";

import { useId, useState } from "react";
import { upload } from "@vercel/blob/client";
import { FileDropzone } from "@/components/FileDropzone";
import { SaveToast } from "@/components/ActionForm";
import type { UploadedBlobMeta, UploadAuthContext } from "@/lib/documents";

export function DocumentUploadForm({
  context,
  onUpload,
  onUploadWithStage,
  onUploadWithSigner,
  onUploadWithStageAndSigner,
  onUploadingChange,
  stageOptions,
  signerOptions,
  maxFiles = 5,
  showVisibilityToggle = false,
  submitLabel = "Upload document(s)",
  className,
}: {
  context: UploadAuthContext;
  // Exactly one of these four is used, picked by which of stageOptions /
  // signerOptions is provided -- kept as separate props (rather than one
  // variable-arity callback) so each call site's bound server action can be
  // passed straight through without a wrapping arrow function, which would
  // break passing it down from a Server Component.
  onUpload?: (blobs: UploadedBlobMeta[], visibleToClient: boolean) => Promise<void>;
  onUploadWithStage?: (stageIndex: number | null, blobs: UploadedBlobMeta[], visibleToClient: boolean) => Promise<void>;
  onUploadWithSigner?: (signerId: string | null, blobs: UploadedBlobMeta[], visibleToClient: boolean) => Promise<void>;
  onUploadWithStageAndSigner?: (
    stageIndex: number | null,
    signerId: string | null,
    blobs: UploadedBlobMeta[],
    visibleToClient: boolean
  ) => Promise<void>;
  // Lets a parent that can unmount or navigate away from this form (e.g. a
  // collapsible panel) hold off until the upload actually finishes.
  onUploadingChange?: (uploading: boolean) => void;
  stageOptions?: { index: number; title: string }[];
  signerOptions?: { id: string; name: string }[];
  maxFiles?: number;
  showVisibilityToggle?: boolean;
  submitLabel?: string;
  className?: string;
}) {
  const stageSelectId = useId();
  const signerSelectId = useId();

  // The stage/signer pickers below render whenever stageOptions/signerOptions
  // are provided -- if the matching callback that would actually carry the
  // chosen value wasn't also provided, handleSubmit's priority dispatch
  // would silently fall through to a callback that drops it. Failing loudly
  // here, rather than quietly losing the picked value, catches that at the
  // call site instead of in production.
  if (stageOptions && !onUploadWithStage && !onUploadWithStageAndSigner) {
    throw new Error(
      "DocumentUploadForm: stageOptions was provided, but neither onUploadWithStage nor onUploadWithStageAndSigner was -- the chosen stage would be silently dropped."
    );
  }
  if (signerOptions && signerOptions.length > 0 && !onUploadWithSigner && !onUploadWithStageAndSigner) {
    throw new Error(
      "DocumentUploadForm: signerOptions was provided, but neither onUploadWithSigner nor onUploadWithStageAndSigner was -- the chosen signer would be silently dropped."
    );
  }

  const [files, setFiles] = useState<File[]>([]);
  const [visibleToClient, setVisibleToClient] = useState(false);
  const [stageIndex, setStageIndex] = useState<number | null>(null);
  const [signerId, setSignerId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ at: number; message: string; variant: "success" | "error" } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (files.length === 0) {
      setToast({ at: Date.now(), message: "Choose at least one file to upload", variant: "error" });
      return;
    }

    setUploading(true);
    onUploadingChange?.(true);
    try {
      const blobs: UploadedBlobMeta[] = await Promise.all(
        files.map(async (file) => {
          const result = await upload(`clients/${context.clientId}/${file.name}`, file, {
            access: "private",
            handleUploadUrl: "/api/blob-upload",
            clientPayload: JSON.stringify(context),
          });
          return {
            filename: file.name,
            pathname: result.pathname,
            url: result.url,
            contentType: file.type || null,
            size: file.size,
          };
        })
      );

      // Which callback fires is decided by which ones the caller actually
      // passed in, not by whether signerOptions/stageOptions happens to be
      // empty right now -- a caller that supports signer tagging still
      // wires up onUploadWithSigner even before any signers exist yet, so
      // that still has to be what runs once one gets added later.
      if (onUploadWithStageAndSigner) {
        await onUploadWithStageAndSigner(stageIndex, signerId, blobs, visibleToClient);
      } else if (onUploadWithStage) {
        await onUploadWithStage(stageIndex, blobs, visibleToClient);
      } else if (onUploadWithSigner) {
        await onUploadWithSigner(signerId, blobs, visibleToClient);
      } else {
        await onUpload!(blobs, visibleToClient);
      }
      setFiles([]);
      setVisibleToClient(false);
      setStageIndex(null);
      setSignerId(null);
      setToast({ at: Date.now(), message: "Document(s) uploaded.", variant: "success" });
    } catch (err) {
      setToast({
        at: Date.now(),
        message: err instanceof Error ? err.message : "Upload failed. Please try again.",
        variant: "error",
      });
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <FileDropzone files={files} onFilesChange={setFiles} maxFiles={maxFiles} />
      {signerOptions && signerOptions.length > 0 && (
        <div>
          <label htmlFor={signerSelectId} className="block text-xs font-medium text-stone-500 mb-1">
            Who is this document for?
          </label>
          <select
            id={signerSelectId}
            value={signerId ?? ""}
            onChange={(e) => setSignerId(e.target.value === "" ? null : e.target.value)}
            className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
          >
            <option value="">Shared / not specific to one person</option>
            {signerOptions.map((signer) => (
              <option key={signer.id} value={signer.id}>
                {signer.name}
              </option>
            ))}
          </select>
        </div>
      )}
      {stageOptions && (
        <div>
          <label htmlFor={stageSelectId} className="block text-xs font-medium text-stone-500 mb-1">
            Which stage does this document belong to?
          </label>
          <select
            id={stageSelectId}
            value={stageIndex ?? ""}
            onChange={(e) => setStageIndex(e.target.value === "" ? null : Number(e.target.value))}
            className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
          >
            <option value="">No specific stage</option>
            {stageOptions.map((stage) => (
              <option key={stage.index} value={stage.index}>
                {stage.index + 1}. {stage.title}
              </option>
            ))}
          </select>
        </div>
      )}
      {showVisibilityToggle && (
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input
            type="checkbox"
            checked={visibleToClient}
            onChange={(e) => setVisibleToClient(e.target.checked)}
            className="rounded"
          />
          Visible to client on their tracker page
        </label>
      )}
      <button
        type="submit"
        disabled={uploading}
        className="rounded-md bg-amber-600 text-white text-sm font-medium px-4 py-2 shadow-sm hover:shadow-md hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? "Uploading…" : submitLabel}
      </button>
      {toast && <SaveToast key={toast.at} message={toast.message} variant={toast.variant} />}
    </form>
  );
}
