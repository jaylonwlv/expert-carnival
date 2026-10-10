"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PdfPages, type PageSize } from "@/components/PdfPages";
import { FIELD_TYPES, fieldTypeConfig, type PlacedFieldPayload } from "@/lib/signatureFields";
import type { SignatureFieldType } from "@/lib/signature";

type EditorField = PlacedFieldPayload & { id: string; pageSize: PageSize };

export function PdfFieldEditor({
  fileUrl,
  onSend,
}: {
  fileUrl: string;
  onSend: (fields: PlacedFieldPayload[]) => Promise<void>;
}) {
  const router = useRouter();
  const [armedType, setArmedType] = useState<SignatureFieldType | null>(null);
  const [fields, setFields] = useState<EditorField[]>([]);
  const [sending, setSending] = useState(false);
  const dragState = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

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

  function removeField(id: string) {
    setFields((prev) => prev.filter((f) => f.id !== id));
  }

  async function handleSend() {
    setSending(true);
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
        }))
      );
      router.refresh();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-lg p-3 flex-wrap">
        <p className="text-sm font-medium text-neutral-700 mr-1">Add field:</p>
        {FIELD_TYPES.map((config) => (
          <button
            key={config.type}
            type="button"
            onClick={() => setArmedType(armedType === config.type ? null : config.type)}
            className={`text-sm font-medium px-3 py-1.5 rounded-md border transition ${
              armedType === config.type
                ? "bg-neutral-900 text-white border-neutral-900"
                : "bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100"
            }`}
          >
            {config.label}
          </button>
        ))}
        {armedType && (
          <p className="text-sm text-neutral-500">Click anywhere on the document to place it.</p>
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
                className="absolute border-2 border-indigo-500 bg-indigo-50/70 rounded cursor-move flex items-center justify-center gap-1 group"
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
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeField(field.id);
                  }}
                  className="shrink-0 w-4 h-4 rounded-full bg-white text-red-600 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  aria-label="Remove field"
                >
                  ×
                </button>
              </div>
            ))
        }
      />

      <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
        <p className="text-sm text-neutral-500">{fields.length} field{fields.length === 1 ? "" : "s"} placed</p>
        <button
          type="button"
          onClick={handleSend}
          disabled={fields.length === 0 || sending}
          className="rounded-md bg-neutral-900 text-white text-sm font-medium px-4 py-2 shadow-sm hover:shadow-md hover:bg-neutral-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? "Sending…" : "Send for signature"}
        </button>
      </div>
    </div>
  );
}
