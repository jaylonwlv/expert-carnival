"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { timeAgo } from "@/lib/format";
import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { DocumentUploadForm } from "@/components/DocumentUploadForm";
import type { ChecklistStatus } from "@/lib/checklist";
import type { NeighborhoodGroup } from "@/lib/neighborhoods";
import type { UploadedBlobMeta } from "@/lib/documents";

// Leaflet touches `window` at import time, which breaks SSR -- load client-only.
const NeighborhoodMapPicker = dynamic(
  () => import("@/components/NeighborhoodMapPicker").then((m) => m.NeighborhoodMapPicker),
  { ssr: false, loading: () => <div className="h-80 rounded-lg bg-stone-50 animate-pulse" /> }
);

export type ChecklistStageData = {
  index: number;
  title: string;
  summary: string;
  documentHeavy: boolean;
  showNeighborhoods: boolean;
  showTourLink: boolean;
  items: { id: string; label: string; status: ChecklistStatus; statusAt: Date | null }[];
  documentCount: number;
};

export function ChecklistAccordion({
  clientId,
  stages,
  currentStageIndex,
  documentsHref,
  tourHref,
  onSetStatus,
  uploadAction,
  signers,
  neighborhoods,
  updateNeighborhoodsAction,
}: {
  clientId: string;
  stages: ChecklistStageData[];
  currentStageIndex: number;
  documentsHref: string;
  tourHref: string;
  onSetStatus: (itemId: string, status: ChecklistStatus) => void;
  uploadAction: (stageIndex: number, signerId: string | null, blobs: UploadedBlobMeta[], visibleToClient: boolean) => Promise<void>;
  signers: { id: string; name: string }[];
  neighborhoods: { groups: NeighborhoodGroup[]; selected: string[] };
  updateNeighborhoodsAction: (formData: FormData) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState<number | null>(currentStageIndex);

  // Optimistic local copy: a toggle should feel instant, not wait on the
  // round trip through the server action + full page revalidation. Re-synced
  // (via the render-time reset below, per React's docs for adjusting state
  // when a prop changes) whenever fresh server data actually arrives.
  const [prevStages, setPrevStages] = useState(stages);
  const [localStages, setLocalStages] = useState(stages);
  if (stages !== prevStages) {
    setPrevStages(stages);
    setLocalStages(stages);
  }

  function handleSetStatus(itemId: string, status: ChecklistStatus) {
    setLocalStages((prev) =>
      prev.map((stage) => ({
        ...stage,
        items: stage.items.map((item) =>
          item.id === itemId ? { ...item, status, statusAt: new Date() } : item
        ),
      }))
    );
    onSetStatus(itemId, status);
  }

  return (
    <div className="divide-y divide-stone-100">
      {localStages.map((stage) => {
        const isOpen = expanded === stage.index;
        const doneCount = stage.items.filter((i) => i.status !== "pending").length;

        return (
          <div key={stage.index}>
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : stage.index)}
              className="w-full flex items-center justify-between gap-3 py-4 text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`text-sm font-semibold shrink-0 rounded-full px-2.5 py-1 ${
                    stage.index === currentStageIndex
                      ? "bg-stone-900 text-white"
                      : "bg-stone-100 text-stone-500"
                  }`}
                >
                  {stage.index + 1}
                </span>
                <span className="text-base font-medium text-stone-900 truncate">{stage.title}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm text-stone-500">
                  {doneCount}/{stage.items.length}
                </span>
                <svg
                  className={`w-5 h-5 text-stone-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </button>

            {isOpen && (
              <div className="pb-5 space-y-4">
                <ul className="divide-y divide-stone-100 border border-stone-200 rounded-lg overflow-hidden">
                  {stage.items.map((item) => (
                    <ChecklistRow key={item.id} item={item} onSetStatus={handleSetStatus} />
                  ))}
                </ul>

                {stage.showTourLink && (
                  <Link
                    href={tourHref}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-700 hover:text-stone-900 hover:underline"
                  >
                    Plan tour route →
                  </Link>
                )}

                {stage.showNeighborhoods && (
                  <ActionForm
                    action={updateNeighborhoodsAction}
                    toastMessage="Preferred neighborhoods saved."
                    className="pt-3 border-t border-stone-100 space-y-3"
                  >
                    <p className="text-sm font-semibold text-stone-700">Preferred neighborhoods</p>
                    <p className="text-sm text-stone-500">
                      Click a pin (or a chip below the map) to select. Drag a pin to correct its position.
                    </p>
                    <NeighborhoodMapPicker groups={neighborhoods.groups} selected={neighborhoods.selected} />
                    <SubmitButton
                      pendingText="Saving…"
                      className="rounded-md bg-amber-600 text-white text-sm font-medium px-4 py-2 shadow-sm hover:shadow-md hover:bg-amber-700 transition"
                    >
                      Save neighborhoods
                    </SubmitButton>
                  </ActionForm>
                )}

                {stage.documentHeavy && (
                  <div className="pt-3 border-t border-stone-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-stone-600">
                        Documents for this stage{" "}
                        {stage.documentCount > 0 && (
                          <span className="text-stone-400">({stage.documentCount} uploaded)</span>
                        )}
                      </p>
                      <Link href={documentsHref} className="text-sm text-stone-500 hover:underline">
                        View all documents
                      </Link>
                    </div>
                    <DocumentUploadForm
                      context={{ kind: "admin", clientId }}
                      onUploadWithSigner={(signerId, blobs, visibleToClient) =>
                        uploadAction(stage.index, signerId, blobs, visibleToClient)
                      }
                      signerOptions={signers}
                      className="space-y-3"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ChecklistRow({
  item,
  onSetStatus,
}: {
  item: ChecklistStageData["items"][number];
  onSetStatus: (itemId: string, status: ChecklistStatus) => void;
}) {
  if (item.status === "not_needed") {
    return (
      <li className="flex items-center gap-3 text-base px-3 py-2.5 bg-white">
        <span className="shrink-0 w-5 h-5 rounded border border-stone-300 flex items-center justify-center text-stone-400">
          –
        </span>
        <span className="flex-1 text-stone-400 italic">{item.label} (not needed)</span>
        <button
          type="button"
          onClick={() => onSetStatus(item.id, "pending")}
          className="text-sm text-stone-500 hover:underline shrink-0"
        >
          Undo
        </button>
      </li>
    );
  }

  if (item.status === "done") {
    return (
      <li className="flex items-center gap-3 text-base px-3 py-2.5 bg-white">
        <button
          type="button"
          onClick={() => onSetStatus(item.id, "pending")}
          className="shrink-0 w-5 h-5 rounded bg-emerald-600 text-white flex items-center justify-center"
          aria-label="Mark as not done"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M16.704 5.29a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 111.06-1.06l2.97 2.97 6.97-6.97a.75.75 0 011.06 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <span className="flex-1 text-stone-700">{item.label}</span>
        {item.statusAt && <span className="text-sm text-stone-400 shrink-0">{timeAgo(item.statusAt)}</span>}
      </li>
    );
  }

  return (
    <li className="flex items-center gap-3 text-base px-3 py-2.5 bg-white">
      <button
        type="button"
        onClick={() => onSetStatus(item.id, "done")}
        className="shrink-0 w-5 h-5 rounded border border-stone-300 hover:border-stone-500"
        aria-label="Mark as done"
      />
      <span className="flex-1 text-stone-700">{item.label}</span>
      <button
        type="button"
        onClick={() => onSetStatus(item.id, "not_needed")}
        className="text-sm text-stone-400 hover:underline shrink-0"
      >
        Not needed
      </button>
    </li>
  );
}
