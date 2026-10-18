import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { SiteFooter } from "./SiteFooter";

export function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#faf8f4] flex flex-col">
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <Link href="/" className="inline-block">
            <Image src="/logo.png" alt="Relocation Engine" width={680} height={546} className="h-14 w-auto" />
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
        <h1 className="text-2xl font-bold text-stone-900">{title}</h1>
        {lastUpdated && <p className="text-sm text-stone-400 mt-1 mb-8">Last Updated: {lastUpdated}</p>}
        <div
          className="space-y-4 text-sm text-stone-700 leading-relaxed
          [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-stone-900 [&_h2]:mt-8 [&_h2]:mb-1
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_strong]:text-stone-900"
        >
          {children}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
