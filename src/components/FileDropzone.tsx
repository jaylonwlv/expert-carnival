"use client";

import { useRef, useState } from "react";
import { formatFileSize } from "@/lib/format";

export function FileDropzone({ name, maxFiles = 5 }: { name: string; maxFiles?: number }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);

  function syncInput(nextFiles: File[]) {
    const dt = new DataTransfer();
    nextFiles.forEach((file) => dt.items.add(file));
    if (inputRef.current) {
      inputRef.current.files = dt.files;
    }
    setFiles(nextFiles);
  }

  function addFiles(incoming: FileList | null) {
    if (!incoming || incoming.length === 0) return;
    const combined = [...files, ...Array.from(incoming)].slice(0, maxFiles);
    syncInput(combined);
  }

  function removeFile(index: number) {
    syncInput(files.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center cursor-pointer transition ${
          dragOver
            ? "border-neutral-900 bg-neutral-50"
            : "border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50"
        }`}
      >
        <svg className="w-8 h-8 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 16V4m0 0L8 8m4-4l4 4M5 16v2a2 2 0 002 2h10a2 2 0 002-2v-2"
          />
        </svg>
        <p className="text-sm font-medium text-neutral-700">
          <span className="text-neutral-900 underline">Click to browse</span> or drag and drop
        </p>
        <p className="text-xs text-neutral-400">Up to {maxFiles} files</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        name={name}
        multiple
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />

      {files.length > 0 && (
        <ul className="divide-y divide-neutral-100 border border-neutral-200 rounded-lg bg-white">
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-2 px-3 py-2">
              <span className="text-sm text-neutral-800 truncate">{file.name}</span>
              <span className="text-xs text-neutral-400 shrink-0">{formatFileSize(file.size)}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="text-neutral-400 hover:text-red-600 shrink-0 text-sm px-1"
                aria-label={`Remove ${file.name}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
