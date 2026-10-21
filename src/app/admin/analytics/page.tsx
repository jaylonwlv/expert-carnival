import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DatabaseUnavailable } from "@/components/DatabaseUnavailable";
import { isDatabaseConnectivityError } from "@/lib/dbErrors";

export const dynamic = "force-dynamic";

// Friendlier labels for the utm_medium values this app actually sets --
// "short_form" from the /tt, /ig, /yt redirects (lib/shortLinks.ts),
// "in_app_browser" from the proxy's passive User-Agent fallback
// (lib/inAppBrowser.ts) -- so the breakdown reads as "how this lead got
// tagged" rather than a raw query-param value. Anything else (e.g. a
// hand-built ad link's own utm_medium) is shown as typed.
const MEDIUM_LABELS: Record<string, string> = {
  short_form: "Short link (/tt, /ig, /yt)",
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
              subtitle="Explicit ad/short-link tags vs. a detected in-app browser vs. untagged."
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
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
      <p className="text-sm font-semibold text-stone-900">{title}</p>
      <p className="text-xs text-stone-500 mt-0.5 mb-4">{subtitle}</p>
      <div className="space-y-3">
        {rows.map((row) => {
          const pct = total > 0 ? Math.round((row.count / total) * 100) : 0;
          return (
            <div key={row.label}>
              <div className="flex items-baseline justify-between text-sm mb-1">
                <span className="font-medium text-stone-800">{row.label}</span>
                <span className="text-stone-500 tabular-nums">
                  {row.count} <span className="text-stone-400">({pct}%)</span>
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
                <div className="h-full rounded-full bg-amber-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
