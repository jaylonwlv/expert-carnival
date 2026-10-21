import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DatabaseUnavailable } from "@/components/DatabaseUnavailable";
import { isDatabaseConnectivityError } from "@/lib/dbErrors";

export const dynamic = "force-dynamic";

// Friendlier label for the one utm_medium value this app sets itself --
// "in_app_browser" from the proxy's passive User-Agent fallback
// (lib/inAppBrowser.ts) -- so the breakdown reads as "how this lead got
// tagged" rather than a raw query-param value. Anything else (e.g. a
// hand-built ad link's own utm_medium) is shown as typed.
const MEDIUM_LABELS: Record<string, string> = {
  in_app_browser: "Detected in-app browser",
};

type Row = { label: string; count: number };

function capitalizeFirst(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default async function AnalyticsPage() {
  let totalLeads: number;
  let sourceRows: { utmSource: string | null; _count: { _all: number } }[];
  let mediumRows: { utmMedium: string | null; _count: { _all: number } }[];

  try {
    // Scoped to source: { not: null } the same way the dashboard's own
    // "Leads by type" card is -- only actual lead-form submissions carry
    // utm data at all, so a client Paulin added by hand shouldn't dilute
    // the breakdown with another "Direct" row.
    [totalLeads, sourceRows, mediumRows] = await Promise.all([
      prisma.client.count({ where: { source: { not: null } } }),
      prisma.client.groupBy({
        by: ["utmSource"],
        where: { source: { not: null } },
        _count: { _all: true },
      }),
      prisma.client.groupBy({
        by: ["utmMedium"],
        where: { source: { not: null } },
        _count: { _all: true },
      }),
    ]);
  } catch (error) {
    if (!isDatabaseConnectivityError(error)) throw error;
    return <DatabaseUnavailable retryHref="/admin/analytics" />;
  }

  const bySource: Row[] = sourceRows
    .map((row) => ({
      label: row.utmSource ? capitalizeFirst(row.utmSource) : "Direct / no link tag",
      count: row._count._all,
    }))
    .sort((a, b) => b.count - a.count);

  const byMedium: Row[] = mediumRows
    .map((row) => ({
      label: row.utmMedium ? (MEDIUM_LABELS[row.utmMedium] ?? capitalizeFirst(row.utmMedium)) : "Direct / no link tag",
      count: row._count._all,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="min-h-screen bg-[#faf8f4]">
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Image src="/logo.png" alt="Relocation Engine LLC" width={680} height={546} className="h-20 w-auto" priority />
          <Link href="/admin" className="text-sm font-medium text-stone-500 hover:text-stone-800 transition">
            ← Back to dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Analytics</h1>
          <p className="text-sm text-stone-500 mt-1">
            {totalLeads} lead-form submission{totalLeads === 1 ? "" : "s"} total.
          </p>
        </div>

        {totalLeads === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 py-16 text-center">
            <p className="text-sm text-stone-500">No lead-form submissions yet.</p>
          </div>
        ) : (
          <>
            <BreakdownCard
              title="Leads by platform"
              subtitle="Where each lead's link was tagged from (utm_source)."
              rows={bySource}
              total={totalLeads}
            />
            <BreakdownCard
              title="How leads were tagged"
              subtitle="An explicit ad tag vs. a detected in-app browser vs. untagged."
              rows={byMedium}
              total={totalLeads}
            />
          </>
        )}
      </main>
    </div>
  );
}

function BreakdownCard({ title, subtitle, rows, total }: { title: string; subtitle: string; rows: Row[]; total: number }) {
  // Bar height is relative to the largest row here, not `total` -- a 2-bar
  // chart where one row is 90% of all leads would otherwise draw both bars
  // nearly full-height and erase the actual size difference between them.
  const max = Math.max(...rows.map((row) => row.count), 1);
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
      <p className="text-sm font-semibold text-stone-900">{title}</p>
      <p className="text-xs text-stone-500 mt-0.5 mb-6">{subtitle}</p>
      <div className="flex items-end gap-4 h-40 border-b border-stone-200">
        {rows.map((row) => {
          const pct = total > 0 ? Math.round((row.count / total) * 100) : 0;
          const heightPct = Math.max((row.count / max) * 100, 4);
          return (
            <div key={row.label} className="flex-1 flex flex-col items-center justify-end h-full">
              <span className="text-xs font-semibold text-stone-700 tabular-nums mb-1">{row.count}</span>
              <div
                className="w-full max-w-14 rounded-t-[4px] bg-amber-500 hover:bg-amber-600 transition-colors cursor-default"
                style={{ height: `${heightPct}%` }}
                title={`${row.label}: ${row.count} lead${row.count === 1 ? "" : "s"} (${pct}%)`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 mt-2">
        {rows.map((row) => (
          <div key={row.label} className="flex-1 text-center">
            <p className="text-xs text-stone-500 leading-tight">{row.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
