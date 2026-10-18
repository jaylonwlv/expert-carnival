import Image from "next/image";
import { BUSINESS } from "@/lib/business";

// Rendered directly by a page that catches a database-connectivity error
// itself, rather than letting it fall through to the root error.tsx. That
// boundary can't show this specific a message: Next.js (and React, on top
// of it) redacts the real server-side error before it reaches the client
// in production, leaving only a generic "Something went wrong" regardless
// of what was actually thrown -- confirmed directly, not assumed. Catching
// the error where it happens and returning this as an ordinary render is
// the only way to say something more useful than that.
export function DatabaseUnavailable({ retryHref }: { retryHref: string }) {
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
        <h1 className="text-xl font-semibold text-stone-900">Can&apos;t reach the database</h1>
        <p className="text-sm text-stone-600 mt-2 leading-relaxed">
          This is usually temporary. Refresh in a moment, or reach out directly if it keeps
          happening.
        </p>
        <div className="mt-6 flex flex-col gap-2.5">
          <a
            href={retryHref}
            className="w-full text-center rounded-md bg-amber-600 text-white text-sm font-semibold py-2.5 shadow-sm hover:shadow-md hover:bg-amber-700 transition"
          >
            Try again
          </a>
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
