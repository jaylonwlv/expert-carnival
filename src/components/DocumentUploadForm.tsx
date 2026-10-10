"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { FileDropzone } from "@/components/FileDropzone";
import { SaveToast } from "@/components/ActionForm";
import type { UploadedBlobMeta, UploadAuthContext } from "@/lib/documents";

export function DocumentUploadForm({
  context,
  onUpload,
  onUploadWithStage,
  stageOptions,
  maxFiles = 5,
  showVisibilityToggle = false,
  submitLabel = "Upload document(s)",
  className,
}: {
  context: UploadAuthContext;
  // Exactly one of these two is used, picked by whether stageOptions is
  // provided -- kept as two separate props rather than one variable-arity
  // callback so each call site's existing prop stays untouched.
  onUpload?: (blobs: UploadedBlobMeta[], visibleToClient: boolean) => Promise<void>;
  onUploadWithStage?: (stageIndex: number | null, blobs: UploadedBlobMeta[], visibleToClient: boolean) => Promise<void>;
  stageOptions?: { index: number; title: string }[];
  maxFiles?: number;
  showVisibilityToggle?: boolean;
  submitLabel?: string;
  className?: string;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [visibleToClient, setVisibleToClient] = useState(false);
  const [stageIndex, setStageIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ at: number; message: string; variant: "success" | "error" } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (files.length === 0) {
      setToast({ at: Date.now(), message: "Choose at least one file to upload", variant: "error" });
      return;
    }

    setUploading(true);
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

      if (stageOptions) {
        await onUploadWithStage!(stageIndex, blobs, visibleToClient);
      } else {
        await onUpload!(blobs, visibleToClient);
      }
      setFiles([]);
      setVisibleToClient(false);
      setStageIndex(null);
      setToast({ at: Date.now(), message: "Document(s) uploaded.", variant: "success" });
    } catch (err) {
      setToast({
        at: Date.now(),
        message: err instanceof Error ? err.message : "Upload failed. Please try again.",
        variant: "error",
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <FileDropzone files={files} onFilesChange={setFiles} maxFiles={maxFiles} />
      {stageOptions && (
        <div>
          <label htmlFor="stageIndex" className="block text-xs font-medium text-stone-500 mb-1">
            Which stage does this document belong to?
          </label>
          <select
            id="stageIndex"
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
