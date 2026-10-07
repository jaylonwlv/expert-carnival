"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const MESSAGES: Record<string, string> = {
  stage: "Stage updated.",
  note: "Update saved.",
  documents: "Document(s) uploaded.",
};

export function SavedBanner({ saved }: { saved: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(false);
      router.replace(pathname);
    }, 3000);
    return () => clearTimeout(timeout);
  }, [router, pathname]);

  if (!visible) return null;

  const message = MESSAGES[saved] ?? "Saved.";

  return (
    <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium px-4 py-2.5">
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
          clipRule="evenodd"
        />
      </svg>
      {message}
    </div>
  );
}
