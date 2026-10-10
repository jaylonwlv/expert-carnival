"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { FileDropzone } from "@/components/FileDropzone";
import { SaveToast } from "@/components/ActionForm";
import type { UploadedBlobMeta, UploadAuthContext } from "@/lib/documents";

export function DocumentUploadForm({
  context,
  onUpload,
  maxFiles = 5,
  showVisibilityToggle = false,
  submitLabel = "Upload document(s)",
  className,
}: {
  context: UploadAuthContext;
  onUpload: (blobs: UploadedBlobMeta[], visibleToClient: boolean) => Promise<void>;
  maxFiles?: number;
  showVisibilityToggle?: boolean;
  submitLabel?: string;
  className?: string;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [visibleToClient, setVisibleToClient] = useState(false);
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

      await onUpload(blobs, visibleToClient);
      setFiles([]);
      setVisibleToClient(false);
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
