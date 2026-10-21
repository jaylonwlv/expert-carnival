import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DatabaseUnavailable } from "@/components/DatabaseUnavailable";
import { isDatabaseConnectivityError } from "@/lib/dbErrors";
import { KNOWN_PLATFORMS, DIRECT_COLOR, OTHER_COLOR, classifyPlatform } from "@/lib/platforms";

export const dynamic = "force-dynamic";

// Friendlier label for the one utm_medium value this app sets itself --
// "in_app_browser" from the proxy's passive User-Agent/Referer fallback
// (lib/inAppBrowser.ts) -- so the breakdown reads as "how this lead got
// tagged" rather than a raw query-param value. Anything else (e.g. a
// hand-built ad link's own utm_medium) is shown as typed.
const MEDIUM_LABELS: Record<string, string> = {
  in_app_browser: "Detected in-app browser",
};

type Row = { label: string; count: number };
type PlatformRow = Row & { color: string; detail?: string };

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

  // Every known platform always gets a bar -- including one sitting at
  // zero -- so the chart reads the same way every time (nothing appears or
  // disappears as leads come in) and a platform with no leads yet is still
  // visibly a tracked one, not indistinguishable from "we don't track
  // that." Anything tagged with a utm_source outside the known list (a
  // hand-built ad campaign, a referral partner, etc.) rolls up into one
  // "Other" bar rather than spawning an unbounded, increasingly unreadable
  // number of bars -- its exact breakdown is still one hover away.
  const knownCounts = new Map<string, number>(KNOWN_PLATFORMS.map((p) => [p.key, 0]));
  let directCount = 0;
  const otherCounts = new Map<string, number>();

  for (const row of sourceRows) {
    const count = row._count._all;
    const bucket = classifyPlatform(row.utmSource);
    if (bucket === "direct") {
      directCount += count;
    } else if (bucket === "other") {
      // Not null here -- classifyPlatform only returns "direct" for a null
      // utmSource, so reaching "other" means the row had a real value.
      const raw = row.utmSource as string;
      otherCounts.set(raw, (otherCounts.get(raw) ?? 0) + count);
    } else {
      knownCounts.set(bucket, (knownCounts.get(bucket) ?? 0) + count);
    }
  }

  const otherTotal = [...otherCounts.values()].reduce((sum, c) => sum + c, 0);
  const otherDetail = [...otherCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([source, count]) => `${capitalizeFirst(source)} (${count})`)
    .join(", ");

  // Fixed render order -- the known platforms in their defined sequence,
  // then Direct, then Other -- rather than sorted by count. Sorting by
  // count would shuffle which two colors ever sit next to each other as
  // the numbers change week to week; the color pairing was only validated
  // for *this* fixed adjacency.
  const platformRows: PlatformRow[] = [
    ...KNOWN_PLATFORMS.map((p) => ({ label: p.label, count: knownCounts.get(p.key) ?? 0, color: p.color })),
    { label: "Direct / no link tag", count: directCount, color: DIRECT_COLOR },
    ...(otherTotal > 0 ? [{ label: "Other", count: otherTotal, color: OTHER_COLOR, detail: otherDetail }] : []),
  ];

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
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
              <p className="text-sm font-semibold text-stone-900">Leads by platform</p>
              <p className="text-xs text-stone-500 mt-0.5 mb-6">
                Where each lead&apos;s link was tagged from (utm_source), plus a passively detected
                in-app browser when a lead arrived with no tag at all. Hover a bar for the exact count.
              </p>
              <PlatformChart rows={platformRows} total={totalLeads} />
            </div>

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

function PlatformChart({ rows, total }: { rows: PlatformRow[]; total: number }) {
  // Height is relative to the largest bar here, not `total` -- a chart
  // where one platform is 90% of all leads would otherwise draw every bar
  // nearly full-height and erase the actual size difference between them.
  const max = Math.max(...rows.map((row) => row.count), 1);
  return (
    <div>
      <div className="flex items-end gap-4 h-40 border-b border-stone-200">
        {rows.map((row) => {
          const pct = total > 0 ? Math.round((row.count / total) * 100) : 0;
          // A real zero stays visually a sliver at the baseline (present,
          // in its own color, unmistakably small) rather than either a
          // full 4%-minimum bar (which would read as "a little data") or
          // nothing at all (which would read as "not tracked"/a bug).
          const style =
            row.count > 0
              ? { height: `${Math.max((row.count / max) * 100, 4)}%`, backgroundColor: row.color }
              : { height: "3px", backgroundColor: row.color, opacity: 0.35 };
          const tooltip = `${row.label}: ${row.count} lead${row.count === 1 ? "" : "s"} (${pct}%)${row.detail ? ` -- ${row.detail}` : ""}`;
          return (
            <div key={row.label} className="flex-1 flex flex-col items-center justify-end h-full">
              <span className="text-xs font-semibold text-stone-700 tabular-nums mb-1">{row.count}</span>
              <div
                className="w-full max-w-14 rounded-t-[4px] transition-opacity hover:opacity-75 cursor-default"
                style={style}
                title={tooltip}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 mt-2">
        {rows.map((row) => (
          <div key={row.label} className="flex-1 text-center" title={row.detail}>
            <span
              className="inline-block w-2 h-2 rounded-full mr-1 align-middle"
              style={{ backgroundColor: row.color }}
            />
            <span className="text-xs text-stone-500 leading-tight align-middle">{row.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BreakdownCard({ title, subtitle, rows, total }: { title: string; subtitle: string; rows: Row[]; total: number }) {
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
