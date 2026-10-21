"use client";

import { useEffect } from "react";
import Image from "next/image";
import { BUSINESS } from "@/lib/business";

// Catches anything that throws while rendering a route (the lead-creation
// DB write, say) that isn't already caught closer to the source. Without
// this, that failure shows Next's raw default error screen — unbranded,
// and on the two pages whose logo deliberately isn't a link anywhere else
// on the page, offering no way back into the funnel at all.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#faf8f4] flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <Image
          src="/logo.png"
          alt="Relocation Engine"
          width={680}
          height={546}
          className="h-14 w-auto mx-auto mb-6"
          priority
        />
        <h1 className="text-xl font-semibold text-stone-900">Something went wrong</h1>
        <p className="text-sm text-stone-600 mt-2 leading-relaxed">
          That&apos;s on us, not you. Try again, or reach out directly and we&apos;ll take it from
          here.
        </p>
        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={reset}
            className="w-full text-center rounded-md bg-amber-600 text-white text-sm font-semibold py-2.5 shadow-sm hover:shadow-md hover:bg-amber-700 transition"
          >
            Try again
          </button>
          <a
            href={BUSINESS.phoneHref}
            className="w-full text-center rounded-md border border-stone-300 bg-white text-stone-800 text-sm font-medium py-2.5 shadow-sm hover:bg-stone-50 transition"
          >
            Call {BUSINESS.phone}
          </a>
        </div>
      </div>
    </div>
  );
}
