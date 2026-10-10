"use client";

import { useEffect, useRef, useState } from "react";

const SIGNATURE_FONTS = [
  { name: "Caveat", family: "'Caveat', cursive" },
  { name: "Dancing Script", family: "'Dancing Script', cursive" },
  { name: "Satisfy", family: "'Satisfy', cursive" },
];

type Mode = "type" | "draw" | "upload";

function textToDataUrl(text: string, fontFamily: string, width = 400, height = 120): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.fillStyle = "#000";
  ctx.font = `48px ${fontFamily}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText(text, width / 2, height / 2);
  return canvas.toDataURL("image/png");
}

export function SignaturePad({
  title,
  onConfirm,
  onCancel,
}: {
  title: string;
  onConfirm: (dataUrl: string) => void;
  onCancel: () => void;
}) {
  const [mode, setMode] = useState<Mode>("type");
  const [typedName, setTypedName] = useState("");
  const [fontIndex, setFontIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [uploadedDataUrl, setUploadedDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Caveat&family=Dancing+Script&family=Satisfy&display=swap";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  }

  function pointerPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handleConfirm() {
    if (mode === "type") {
      if (!typedName.trim()) return;
      onConfirm(textToDataUrl(typedName.trim(), SIGNATURE_FONTS[fontIndex].family));
    } else if (mode === "draw") {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn) return;
      onConfirm(canvas.toDataURL("image/png"));
    } else if (mode === "upload") {
      if (uploadedDataUrl) onConfirm(uploadedDataUrl);
    }
  }

  const canConfirm =
    (mode === "type" && typedName.trim() !== "") ||
    (mode === "draw" && hasDrawn) ||
    (mode === "upload" && !!uploadedDataUrl);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
        <h2 className="text-base font-semibold text-neutral-900">{title}</h2>

        <div className="flex gap-1 bg-neutral-100 rounded-lg p-1 w-fit">
          {(["type", "draw", "upload"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`text-sm font-medium px-3 py-1.5 rounded-md capitalize transition ${
                mode === m ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {mode === "type" && (
          <div className="space-y-3">
            <input
              type="text"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="Type your name"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
            <div className="flex gap-2">
              {SIGNATURE_FONTS.map((font, i) => (
                <button
                  key={font.name}
                  type="button"
                  onClick={() => setFontIndex(i)}
                  className={`flex-1 rounded-md border px-2 py-3 text-xl ${
                    fontIndex === i ? "border-neutral-900 ring-1 ring-neutral-900" : "border-neutral-200"
                  }`}
                  style={{ fontFamily: font.family }}
                >
                  {typedName.trim() || "Signature"}
                </button>
              ))}
            </div>
          </div>
        )}

        {mode === "draw" && (
          <div className="space-y-2">
            <canvas
              ref={canvasRef}
              width={440}
              height={160}
              className="w-full border border-neutral-300 rounded-md touch-none bg-white"
              onPointerDown={(e) => {
                drawing.current = true;
                const ctx = e.currentTarget.getContext("2d");
                const { x, y } = pointerPos(e);
                ctx?.beginPath();
                ctx?.moveTo(x, y);
              }}
              onPointerMove={(e) => {
                if (!drawing.current) return;
                const ctx = e.currentTarget.getContext("2d");
                if (!ctx) return;
                const { x, y } = pointerPos(e);
                ctx.lineWidth = 2.5;
                ctx.lineCap = "round";
                ctx.lineTo(x, y);
                ctx.stroke();
                setHasDrawn((prev) => (prev ? prev : true));
              }}
              onPointerUp={() => {
                drawing.current = false;
              }}
              onPointerLeave={() => {
                drawing.current = false;
              }}
            />
            <button type="button" onClick={clearCanvas} className="text-sm text-neutral-500 hover:underline">
              Clear
            </button>
          </div>
        )}

        {mode === "upload" && (
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setUploadedDataUrl(reader.result as string);
                reader.readAsDataURL(file);
              }}
              className="text-sm"
            />
            {uploadedDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={uploadedDataUrl} alt="Uploaded signature" className="max-h-24 border border-neutral-200 rounded-md" />
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-neutral-600 px-4 py-2 rounded-md hover:bg-neutral-100 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="rounded-md bg-neutral-900 text-white text-sm font-medium px-4 py-2 shadow-sm hover:shadow-md hover:bg-neutral-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Use this
          </button>
        </div>
      </div>
    </div>
  );
}
