"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { pdfjsLib } from "@/lib/pdfjs";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";

export type PageSize = { width: number; height: number };

function PdfPageCanvas({
  pdf,
  pageIndex,
  scale,
  onRendered,
}: {
  pdf: PDFDocumentProxy;
  pageIndex: number;
  scale: number;
  onRendered: (pageIndex: number, size: PageSize) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    // Capture the in-flight render task (not just a boolean flag) so cleanup
    // can actually cancel it -- pdf.js throws "Cannot use the same canvas
    // during multiple render() operations" if a second render starts on the
    // same canvas before the first's task is cancelled, which otherwise
    // happens on every Strict Mode double-mount in dev.
    let renderTask: RenderTask | null = null;

    (async () => {
      const page = await pdf.getPage(pageIndex + 1);
      if (cancelled) return;
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      renderTask = page.render({ canvasContext: ctx, viewport });
      try {
        await renderTask.promise;
        if (!cancelled) onRendered(pageIndex, { width: viewport.width, height: viewport.height });
      } catch (err) {
        // Cancelling a task deliberately rejects its promise -- that's expected.
        if (!cancelled) throw err;
      }
    })();

    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [pdf, pageIndex, scale, onRendered]);

  return <canvas ref={canvasRef} className="block" />;
}

export function PdfPages({
  fileUrl,
  scale = 1.3,
  onPageClick,
  renderOverlay,
}: {
  fileUrl: string;
  scale?: number;
  onPageClick?: (pageIndex: number, xPx: number, yPx: number, size: PageSize) => void;
  renderOverlay?: (pageIndex: number, size: PageSize) => ReactNode;
}) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [pageSizes, setPageSizes] = useState<Record<number, PageSize>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    pdfjsLib
      .getDocument({ url: fileUrl })
      .promise.then((doc) => {
        if (!cancelled) setPdf(doc);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load this PDF");
      });
    return () => {
      cancelled = true;
    };
  }, [fileUrl]);

  const handleRendered = useCallback((pageIndex: number, size: PageSize) => {
    setPageSizes((prev) => ({ ...prev, [pageIndex]: size }));
  }, []);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!pdf) return <div className="h-96 rounded-lg bg-stone-50 animate-pulse" />;

  return (
    <div className="space-y-4">
      {Array.from({ length: pdf.numPages }, (_, pageIndex) => {
        const size = pageSizes[pageIndex];
        return (
          <div
            key={pageIndex}
            className="relative mx-auto border border-stone-300 shadow-sm bg-white"
            style={size ? { width: size.width, height: size.height } : { height: 400 }}
            onClick={(e) => {
              if (!onPageClick || !size) return;
              const rect = e.currentTarget.getBoundingClientRect();
              onPageClick(pageIndex, e.clientX - rect.left, e.clientY - rect.top, size);
            }}
          >
            <PdfPageCanvas pdf={pdf} pageIndex={pageIndex} scale={scale} onRendered={handleRendered} />
            {size && renderOverlay?.(pageIndex, size)}
          </div>
        );
      })}
    </div>
  );
}
