"use client";

import { useState } from "react";

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  function handleClick() {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }

  return (
    <div className="flex items-center gap-2">
      <input
        readOnly
        value={url}
        onFocus={(e) => e.currentTarget.select()}
        className="flex-1 rounded-md border border-stone-300 px-3 py-2 text-sm bg-stone-50 text-stone-600"
      />
      <button
        type="button"
        onClick={handleClick}
        className="rounded-md bg-amber-600 text-white text-sm font-medium px-3 py-2 shadow-sm hover:shadow-md hover:bg-amber-700 whitespace-nowrap transition"
      >
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
