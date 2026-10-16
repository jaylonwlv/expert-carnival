"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PdfPages, type PageSize } from "@/components/PdfPages";
import { FIELD_TYPES, fieldTypeConfig, type PlacedFieldPayload } from "@/lib/signatureFields";
import type { SignatureFieldType } from "@/lib/signature";

type EditorField = PlacedFieldPayload & { id: string; pageSize: PageSize };

// A field smaller than this is too small to click or read reliably.
const MIN_FIELD_SIZE_PX = 16;

export function PdfFieldEditor({
  fileUrl,
  onSend,
}: {
  fileUrl: string;
  onSend: (fields: PlacedFieldPayload[], requiresIdAcknowledgment: boolean) => Promise<void>;
}) {
  const router = useRouter();
  const [armedType, setArmedType] = useState<SignatureFieldType | null>(null);
  const [fields, setFields] = useState<EditorField[]>([]);
  const [requiresIdAcknowledgment, setRequiresIdAcknowledgment] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dragState = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const resizeState = useRef<{ id: string; startClientX: number; startClientY: number; startWidthPx: number; startHeightPx: number } | null>(null);

  function handlePageClick(pageIndex: number, xPx: number, yPx: number, size: PageSize) {
    if (!armedType) return;
    const config = fieldTypeConfig(armedType);
    const x = Math.max(0, Math.min(xPx - config.defaultWidth / 2, size.width - config.defaultWidth));
    const y = Math.max(0, Math.min(yPx - config.defaultHeight / 2, size.height - config.defaultHeight));

    setFields((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2),
        type: armedType,
        page: pageIndex,
        xPct: x / size.width,
        yPct: y / size.height,
        widthPct: config.defaultWidth / size.width,
        heightPct: config.defaultHeight / size.height,
        sortOrder: prev.length,
        pageSize: size,
      },
    ]);
    setArmedType(null);
  }

  function handlePointerDownOnField(e: React.PointerEvent, field: EditorField) {
    e.stopPropagation();
    const target = e.currentTarget as HTMLDivElement;
    const rect = target.getBoundingClientRect();
    dragState.current = { id: field.id, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top };
    target.setPointerCapture(e.pointerId);
  }

  function handlePointerMoveOnField(e: React.PointerEvent, field: EditorField) {
    if (dragState.current?.id !== field.id) return;
    const container = (e.currentTarget as HTMLDivElement).parentElement;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const newXPx = e.clientX - containerRect.left - dragState.current.offsetX;
    const newYPx = e.clientY - containerRect.top - dragState.current.offsetY;
    const widthPx = field.widthPct * field.pageSize.width;
    const heightPx = field.heightPct * field.pageSize.height;
    const x = Math.max(0, Math.min(newXPx, field.pageSize.width - widthPx));
    const y = Math.max(0, Math.min(newYPx, field.pageSize.height - heightPx));

    setFields((prev) =>
      prev.map((f) => (f.id === field.id ? { ...f, xPct: x / field.pageSize.width, yPct: y / field.pageSize.height } : f))
    );
  }

  function handlePointerUpOnField() {
    dragState.current = null;
  }

  function handlePointerDownOnResizeHandle(e: React.PointerEvent, field: EditorField) {
    e.stopPropagation();
    resizeState.current = {
      id: field.id,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startWidthPx: field.widthPct * field.pageSize.width,
      startHeightPx: field.heightPct * field.pageSize.height,
    };
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMoveOnResizeHandle(e: React.PointerEvent, field: EditorField) {
    const state = resizeState.current;
    if (state?.id !== field.id) return;
    const maxWidthPx = field.pageSize.width - field.xPct * field.pageSize.width;
    const maxHeightPx = field.pageSize.height - field.yPct * field.pageSize.height;
    const widthPx = Math.max(
      MIN_FIELD_SIZE_PX,
      Math.min(state.startWidthPx + (e.clientX - state.startClientX), maxWidthPx)
    );
    const heightPx = Math.max(
      MIN_FIELD_SIZE_PX,
      Math.min(state.startHeightPx + (e.clientY - state.startClientY), maxHeightPx)
    );

    setFields((prev) =>
      prev.map((f) =>
        f.id === field.id ? { ...f, widthPct: widthPx / f.pageSize.width, heightPct: heightPx / f.pageSize.height } : f
      )
    );
  }

  function handlePointerUpOnResizeHandle() {
    resizeState.current = null;
  }

  function removeField(id: string) {
    setFields((prev) => prev.filter((f) => f.id !== id));
  }

  async function handleSend() {
    setSending(true);
    setError(null);
    try {
      await onSend(
        fields.map((f) => ({
          type: f.type,
          page: f.page,
          xPct: f.xPct,
          yPct: f.yPct,
          widthPct: f.widthPct,
          heightPct: f.heightPct,
          label: f.label,
          sortOrder: f.sortOrder,
        })),
        requiresIdAcknowledgment
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong sending this document for signature.");
      setSending(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-lg p-3 flex-wrap">
        <p className="text-sm font-medium text-stone-700 mr-1">Add field:</p>
        {FIELD_TYPES.map((config) => (
          <button
            key={config.type}
            type="button"
            onClick={() => setArmedType(armedType === config.type ? null : config.type)}
            className={`text-sm font-medium px-3 py-1.5 rounded-md border transition ${
              armedType === config.type
                ? "bg-stone-900 text-white border-stone-900"
                : "bg-white text-stone-700 border-stone-300 hover:bg-stone-100"
            }`}
          >
            {config.label}
          </button>
        ))}
        {armedType && (
          <p className="text-sm text-stone-500">Click anywhere on the document to place it.</p>
        )}
      </div>

      <PdfPages
        fileUrl={fileUrl}
        onPageClick={handlePageClick}
        renderOverlay={(pageIndex) =>
          fields
            .filter((f) => f.page === pageIndex)
            .map((field) => (
              <div
                key={field.id}
                onPointerDown={(e) => handlePointerDownOnField(e, field)}
                onPointerMove={(e) => handlePointerMoveOnField(e, field)}
                onPointerUp={handlePointerUpOnField}
                className="absolute border-2 border-indigo-500 bg-indigo-50/70 rounded cursor-move touch-none flex items-center justify-center gap-1 group"
                style={{
                  left: field.xPct * field.pageSize.width,
                  top: field.yPct * field.pageSize.height,
                  width: field.widthPct * field.pageSize.width,
                  height: field.heightPct * field.pageSize.height,
                }}
              >
                <span className="text-xs font-medium text-indigo-700 select-none truncate px-1">
                  {fieldTypeConfig(field.type).label}
                </span>
                {/* Always visible (not hover-gated) and sized for a thumb, not
                    just a mouse pointer -- a control only shown on :hover is
                    simply never reachable on a touch device. */}
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeField(field.id);
                  }}
                  className="absolute -right-2 -top-2 shrink-0 w-6 h-6 rounded-full bg-white text-red-600 text-sm shadow border border-stone-200 flex items-center justify-center"
                  aria-label="Remove field"
                >
                  ×
                </button>
                <div
                  onPointerDown={(e) => handlePointerDownOnResizeHandle(e, field)}
                  onPointerMove={(e) => handlePointerMoveOnResizeHandle(e, field)}
                  onPointerUp={handlePointerUpOnResizeHandle}
                  className="absolute right-0 bottom-0 w-6 h-6 translate-x-1/2 translate-y-1/2 touch-none cursor-nwse-resize flex items-center justify-center"
                  aria-label="Resize field"
                >
                  <div className="w-3 h-3 rounded-full bg-indigo-600 border border-white shadow" />
                </div>
              </div>
            ))
        }
      />

      <label className="flex items-start gap-2 text-sm text-stone-700 bg-stone-50 border border-stone-200 rounded-lg p-3">
        <input
          type="checkbox"
          checked={requiresIdAcknowledgment}
          onChange={(e) => setRequiresIdAcknowledgment(e.target.checked)}
          className="mt-0.5 rounded"
        />
        This is the client&apos;s first document (e.g. Duties Owed) — require them to confirm it matches their
        valid ID before they can view and sign it.
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center justify-between pt-3 border-t border-stone-100">
        <p className="text-sm text-stone-500">{fields.length} field{fields.length === 1 ? "" : "s"} placed</p>
        <button
          type="button"
          onClick={handleSend}
          disabled={fields.length === 0 || sending}
          className="rounded-md bg-amber-600 text-white text-sm font-medium px-4 py-2 shadow-sm hover:shadow-md hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? "Sending…" : "Send for signature"}
        </button>
      </div>
    </div>
  );
}
