"use client";

import { useState } from "react";
import { formatFileSize, fileKindLabel, isImageFile } from "@/lib/format";
import { FileTypeIcon } from "@/components/FileTypeIcon";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";

type GalleryDocument = {
  id: string;
  filename: string;
  downloadUrl: string;
  size: number;
  contentType: string | null;
  visibleToClient: boolean;
  createdAt: Date;
};

type ViewMode = "list" | "medium" | "large";

export function DocumentGallery({
  documents,
  deleteAction,
  toggleAction,
}: {
  documents: GalleryDocument[];
  deleteAction: (documentId: string) => void;
  toggleAction: (documentId: string) => void;
}) {
  const [view, setView] = useState<ViewMode>("medium");

  if (documents.length === 0) {
    return (
      <p className="text-sm text-neutral-500 py-12 text-center">
        No documents uploaded yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-1 bg-neutral-100 rounded-lg p-1 w-fit">
        {(["list", "medium", "large"] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setView(mode)}
            className={`text-xs font-medium px-3 py-1.5 rounded-md capitalize transition ${
              view === mode ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {view === "list" ? (
        <ul className="divide-y divide-neutral-100 border border-neutral-200 rounded-lg bg-white">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-center gap-3 px-4 py-3">
              <FileTypeIcon kind={fileKindLabel(doc.contentType, doc.filename)} size="sm" />
              <a
                href={doc.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-sm font-medium text-neutral-900 hover:underline truncate"
              >
                {doc.filename}
              </a>
              <span className="text-xs text-neutral-400 shrink-0">{formatFileSize(doc.size)}</span>
              <VisibilityBadge
                visible={doc.visibleToClient}
                filename={doc.filename}
                onConfirmed={() => toggleAction(doc.id)}
              />
              <ConfirmSubmitButton
                action={deleteAction.bind(null, doc.id)}
                confirmMessage={`Delete ${doc.filename}? This can't be undone.`}
                label="Delete"
                className="text-sm text-red-600 hover:text-red-700 hover:underline shrink-0"
              />
            </li>
          ))}
        </ul>
      ) : (
        <div
          className={`grid gap-4 ${
            view === "large" ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-3 sm:grid-cols-4"
          }`}
        >
          {documents.map((doc) => {
            const thumbHeight = view === "large" ? "h-40" : "h-24";
            return (
              <div
                key={doc.id}
                className="group relative bg-white border border-neutral-200 rounded-xl p-3 flex flex-col gap-2 hover:shadow-md transition"
              >
                <a
                  href={doc.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center rounded-lg bg-neutral-50 overflow-hidden ${thumbHeight}`}
                >
                  {isImageFile(doc.contentType, doc.filename) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={doc.downloadUrl}
                      alt={doc.filename}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FileTypeIcon kind={fileKindLabel(doc.contentType, doc.filename)} size={view === "large" ? "lg" : "md"} />
                  )}
                </a>
                <p className="text-sm font-medium text-neutral-900 truncate" title={doc.filename}>
                  {doc.filename}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-neutral-400">{formatFileSize(doc.size)}</span>
                  <VisibilityBadge
                    visible={doc.visibleToClient}
                    filename={doc.filename}
                    onConfirmed={() => toggleAction(doc.id)}
                  />
                </div>
                <ConfirmSubmitButton
                  action={deleteAction.bind(null, doc.id)}
                  confirmMessage={`Delete ${doc.filename}? This can't be undone.`}
                  label="Delete"
                  className="text-xs text-red-600 hover:text-red-700 hover:underline text-left"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function VisibilityBadge({
  visible,
  filename,
  onConfirmed,
}: {
  visible: boolean;
  filename: string;
  onConfirmed: () => void;
}) {
  function handleClick() {
    const message = visible
      ? `Hide "${filename}" from the client? It will no longer appear on their tracker page.`
      : `Make "${filename}" visible to the client? They'll be able to see and download it from their tracker page.`;
    if (confirm(message)) {
      onConfirmed();
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`text-xs font-medium rounded-full px-2.5 py-1 shrink-0 ${
        visible
          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
          : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
      }`}
    >
      {visible ? "Visible to client" : "Admin only"}
    </button>
  );
}
