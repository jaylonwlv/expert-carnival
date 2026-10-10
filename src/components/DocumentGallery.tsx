"use client";

import { useState } from "react";
import Link from "next/link";
import { formatFileSize, fileKindLabel, isImageFile } from "@/lib/format";
import { FileTypeIcon } from "@/components/FileTypeIcon";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { SaveToast } from "@/components/ActionForm";
import { STAGES } from "@/lib/stages";

type GalleryDocument = {
  id: string;
  filename: string;
  downloadUrl: string;
  size: number;
  contentType: string | null;
  visibleToClient: boolean;
  uploadedBy: string;
  stageIndex: number | null;
  signer?: { id: string; name: string } | null;
  createdAt: Date;
  signatureRequest?: { status: string } | null;
};

function isPdf(doc: GalleryDocument): boolean {
  return doc.contentType === "application/pdf" || doc.filename.toLowerCase().endsWith(".pdf");
}

function SignatureBadge({ doc, clientId }: { doc: GalleryDocument; clientId: string }) {
  if (!isPdf(doc)) return null;

  if (!doc.signatureRequest) {
    return (
      <Link
        href={`/admin/clients/${clientId}/documents/${doc.id}/sign-setup`}
        className="text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-full px-2 py-0.5 shrink-0"
      >
        Request signature
      </Link>
    );
  }

  if (doc.signatureRequest.status === "signed") {
    return (
      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5 shrink-0">
        Signed
      </span>
    );
  }

  return (
    <Link
      href={`/admin/clients/${clientId}/documents/${doc.id}/sign-setup`}
      className="text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-full px-2 py-0.5 shrink-0"
    >
      Awaiting signature
    </Link>
  );
}

type ViewMode = "list" | "medium" | "large";

function stageTitle(stageIndex: number | null): string | null {
  if (stageIndex === null) return null;
  return STAGES[stageIndex]?.title ?? null;
}

function SignerSelect({
  doc,
  signerOptions,
  setSignerAction,
}: {
  doc: GalleryDocument;
  signerOptions: { id: string; name: string }[];
  setSignerAction: (documentId: string, signerId: string | null) => Promise<void>;
}) {
  // Optimistic local copy, same pattern as ChecklistAccordion's localStages:
  // kept in sync with the server-provided doc.signer below, but not
  // clobbered by that sync while a change from this select is in flight.
  const [prevSignerId, setPrevSignerId] = useState(doc.signer?.id ?? "");
  const [value, setValue] = useState(doc.signer?.id ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<{ at: number; message: string } | null>(null);
  if (!saving && (doc.signer?.id ?? "") !== prevSignerId) {
    setPrevSignerId(doc.signer?.id ?? "");
    setValue(doc.signer?.id ?? "");
  }

  if (signerOptions.length === 0) return null;

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    const previous = value;
    setValue(next);
    setSaving(true);
    setError(null);
    try {
      await setSignerAction(doc.id, next === "" ? null : next);
    } catch (err) {
      setValue(previous);
      setError({
        at: Date.now(),
        message: err instanceof Error ? err.message : "Could not update signer. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <select
        value={value}
        onChange={handleChange}
        disabled={saving}
        className="text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-full pl-2 pr-1 py-0.5 shrink-0 border-none focus:outline-none focus:ring-2 focus:ring-amber-600 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <option value="">Shared</option>
        {signerOptions.map((signer) => (
          <option key={signer.id} value={signer.id}>
            {signer.name}
          </option>
        ))}
      </select>
      {error && <SaveToast key={error.at} message={error.message} variant="error" />}
    </>
  );
}

export function DocumentGallery({
  documents,
  clientId,
  signerOptions,
  deleteAction,
  toggleAction,
  setSignerAction,
}: {
  documents: GalleryDocument[];
  clientId: string;
  signerOptions: { id: string; name: string }[];
  deleteAction: (documentId: string) => void;
  toggleAction: (documentId: string) => void;
  setSignerAction: (documentId: string, signerId: string | null) => Promise<void>;
}) {
  const [view, setView] = useState<ViewMode>("medium");

  if (documents.length === 0) {
    return (
      <p className="text-sm text-stone-500 py-12 text-center">
        No documents uploaded yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-1 bg-stone-100 rounded-lg p-1 w-fit">
        {(["list", "medium", "large"] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setView(mode)}
            className={`text-xs font-medium px-3 py-1.5 rounded-md capitalize transition ${
              view === mode ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-800"
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {view === "list" ? (
        <ul className="divide-y divide-stone-100 border border-stone-200 rounded-lg bg-white">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-center gap-3 px-4 py-3">
              <FileTypeIcon kind={fileKindLabel(doc.contentType, doc.filename)} size="sm" />
              <a
                href={doc.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-sm font-medium text-stone-900 hover:underline truncate"
              >
                {doc.filename}
              </a>
              {doc.uploadedBy === "client" && (
                <span className="text-xs font-medium text-blue-700 bg-blue-50 rounded-full px-2 py-0.5 shrink-0">
                  From client
                </span>
              )}
              {stageTitle(doc.stageIndex) !== null && (
                <span className="text-xs font-medium text-purple-700 bg-purple-50 rounded-full px-2 py-0.5 shrink-0">
                  {stageTitle(doc.stageIndex)}
                </span>
              )}
              <SignerSelect doc={doc} signerOptions={signerOptions} setSignerAction={setSignerAction} />
              <SignatureBadge doc={doc} clientId={clientId} />
              <span className="text-xs text-stone-400 shrink-0">{formatFileSize(doc.size)}</span>
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
                className="group relative bg-white border border-stone-200 rounded-xl p-3 flex flex-col gap-2 hover:shadow-md transition"
              >
                <a
                  href={doc.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center rounded-lg bg-stone-50 overflow-hidden ${thumbHeight}`}
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
                <p className="text-sm font-medium text-stone-900 truncate" title={doc.filename}>
                  {doc.filename}
                </p>
                {doc.uploadedBy === "client" && (
                  <span className="text-xs font-medium text-blue-700 bg-blue-50 rounded-full px-2 py-0.5 w-fit">
                    From client
                  </span>
                )}
                {stageTitle(doc.stageIndex) !== null && (
                  <span className="text-xs font-medium text-purple-700 bg-purple-50 rounded-full px-2 py-0.5 w-fit">
                    {stageTitle(doc.stageIndex)}
                  </span>
                )}
                <SignerSelect doc={doc} signerOptions={signerOptions} setSignerAction={setSignerAction} />
                <SignatureBadge doc={doc} clientId={clientId} />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-stone-400">{formatFileSize(doc.size)}</span>
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
          : "bg-stone-100 text-stone-500 hover:bg-stone-200"
      }`}
    >
      {visible ? "Visible to client" : "Admin only"}
    </button>
  );
}
