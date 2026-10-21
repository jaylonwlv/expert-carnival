import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DatabaseUnavailable } from "@/components/DatabaseUnavailable";
import { isDatabaseConnectivityError } from "@/lib/dbErrors";
import { KNOWN_PLATFORMS, DIRECT_COLOR, OTHER_COLOR, classifyPlatform } from "@/lib/platforms";
import { capitalizeFirst } from "@/lib/format";

export const dynamic = "force-dynamic";

// Friendlier labels for utm_medium values, "in_app_browser" is the one
// this app sets itself (the proxy's passive User-Agent/Referer fallback in
// lib/inAppBrowser.ts); "cpc" is Paulin's own hand-built tag on her Meta ad
// links, not a generic paid-search tag, so it reads as "Meta Ads" rather
// than the raw param. Anything else is shown as typed.
const MEDIUM_LABELS: Record<string, string> = {
  in_app_browser: "Detected in-app browser",
  cpc: "Meta Ads",
};

type Row = { label: string; count: number };
type PlatformRow = Row & { color: string; detail?: string; href?: string };

// Preset date ranges, newest-first, the same small, fixed set of presets
// the dataviz skill's own filter-control guidance calls for, rather than a
// free-form date picker this page doesn't need. "all" (no lower bound) is
// the default so a bookmarked /admin/analytics link keeps behaving exactly
// as it always has.
const RANGE_OPTIONS = [
  { key: "7d", label: "Last 7 days", days: 7 },
  { key: "30d", label: "Last 30 days", days: 30 },
  { key: "90d", label: "Last 90 days", days: 90 },
  { key: "all", label: "All time", days: null },
] as const;

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const params = await searchParams;
  const activeRange = RANGE_OPTIONS.find((r) => r.key === params.range) ?? RANGE_OPTIONS[3];
  const createdAtFilter = activeRange.days
    ? { gte: new Date(Date.now() - activeRange.days * 24 * 60 * 60 * 1000) }
    : undefined;
  // Scoped to source: { not: null } the same way the dashboard's own
  // "Leads by type" card is, only actual lead-form submissions carry utm
  // data at all, so a client Paulin added by hand shouldn't dilute the
  // breakdown with another "Direct" row.
  const leadsWhere = { source: { not: null } as const, ...(createdAtFilter ? { createdAt: createdAtFilter } : {}) };

  let totalLeads: number;
  let sourceRows: { utmSource: string | null; _count: { _all: number } }[];
  let mediumRows: { utmMedium: string | null; _count: { _all: number } }[];

  try {
    [totalLeads, sourceRows, mediumRows] = await Promise.all([
      prisma.client.count({ where: leadsWhere }),
      prisma.client.groupBy({
        by: ["utmSource"],
        where: leadsWhere,
        _count: { _all: true },
      }),
      prisma.client.groupBy({
        by: ["utmMedium"],
        where: leadsWhere,
        _count: { _all: true },
      }),
    ]);
  } catch (error) {
    if (!isDatabaseConnectivityError(error)) throw error;
    return <DatabaseUnavailable retryHref={activeRange.key === "all" ? "/admin/analytics" : `/admin/analytics?range=${activeRange.key}`} />;
  }

  // Every known platform always gets a bar, including one sitting at
  // zero, so the chart reads the same way every time (nothing appears or
  // disappears as leads come in) and a platform with no leads yet is still
  // visibly a tracked one, not indistinguishable from "we don't track
  // that." Anything tagged with a utm_source outside the known list (a
  // hand-built ad campaign, a referral partner, etc.) rolls up into one
  // "Other" bar rather than spawning an unbounded, increasingly unreadable
  // number of bars, its exact breakdown is still one hover away.
  const knownCounts = new Map<string, number>(KNOWN_PLATFORMS.map((p) => [p.key, 0]));
  let directCount = 0;
  const otherCounts = new Map<string, number>();

  for (const row of sourceRows) {
    const count = row._count._all;
    const bucket = classifyPlatform(row.utmSource);
    if (bucket === "direct") {
      directCount += count;
    } else if (bucket === "other") {
      // Not null here, classifyPlatform only returns "direct" for a null
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

  // Fixed render order, the known platforms in their defined sequence,
  // then Direct, then Other, rather than sorted by count. Sorting by
  // count would shuffle which two colors ever sit next to each other as
  // the numbers change week to week; the color pairing was only validated
  // for *this* fixed adjacency.
  //
  // Each bar's href drills into the client list filtered to exactly the
  // same bucket (see admin/page.tsx's platformWhere), so a click always
  // lands on precisely what the bar and its tooltip claim, both read off
  // the same lib/platforms.ts classification, so they can't drift apart.
  const platformRows: PlatformRow[] = [
    ...KNOWN_PLATFORMS.map((p) => ({
      label: p.label,
      count: knownCounts.get(p.key) ?? 0,
      color: p.color,
      href: `/admin?platform=${p.key}`,
    })),
    { label: "Direct / no link tag", count: directCount, color: DIRECT_COLOR, href: "/admin?platform=direct" },
    ...(otherTotal > 0
      ? [{ label: "Other", count: otherTotal, color: OTHER_COLOR, detail: otherDetail, href: "/admin?platform=other" }]
      : []),
  ];

  const byMedium: (Row & { href: string })[] = mediumRows
    .map((row) => ({
      label: row.utmMedium ? (MEDIUM_LABELS[row.utmMedium] ?? capitalizeFirst(row.utmMedium)) : "Direct / no link tag",
      count: row._count._all,
      href: `/admin?medium=${encodeURIComponent(row.utmMedium ?? "direct")}`,
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
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-stone-900">Analytics Center</h1>
            <p className="text-sm text-stone-500 mt-1">
              {totalLeads} lead-form submission{totalLeads === 1 ? "" : "s"}
              {activeRange.days ? ` in the last ${activeRange.days} days.` : " total."}
            </p>
          </div>
          <div className="flex gap-1.5 bg-white border border-stone-200 rounded-lg p-1">
            {RANGE_OPTIONS.map((range) => (
              <Link
                key={range.key}
                href={range.key === "all" ? "/admin/analytics" : `/admin/analytics?range=${range.key}`}
                className={`text-xs font-medium rounded-md px-3 py-1.5 transition whitespace-nowrap ${
                  range.key === activeRange.key
                    ? "bg-amber-600 text-white"
                    : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"
                }`}
              >
                {range.label}
              </Link>
            ))}
          </div>
        </div>

        {totalLeads === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 py-16 text-center">
            <p className="text-sm text-stone-500">
              No lead-form submissions {activeRange.days ? `in the last ${activeRange.days} days` : "yet"}.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
              <p className="text-sm font-semibold text-stone-900">Leads by platform</p>
              <p className="text-xs text-stone-500 mt-0.5 mb-6">
                Where each lead&apos;s link was tagged from (utm_source), plus a passively detected
                in-app browser when a lead arrived with no tag at all. Click a bar to see those leads.
              </p>
              <PlatformChart rows={platformRows} total={totalLeads} />
            </div>

            <BreakdownCard
              title="How leads were tagged"
              subtitle="An explicit ad tag vs. a detected in-app browser vs. untagged. Click a bar to see those leads."
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
  // Height is relative to the largest bar here, not `total`, a chart
  // where one platform is 90% of all leads would otherwise draw every bar
  // nearly full-height and erase the actual size difference between them.
  const max = Math.max(...rows.map((row) => row.count), 1);
  return (
    <div className="flex items-start gap-4">
      {rows.map((row) => {
        const pct = total > 0 ? Math.round((row.count / total) * 100) : 0;
        // A real zero stays visually a sliver at the baseline (present, in
        // its own color, unmistakably small) rather than either a full
        // 4%-minimum bar (which would read as "a little data") or nothing
        // at all (which would read as "not tracked"/a bug).
        const style =
          row.count > 0
            ? { height: `${Math.max((row.count / max) * 100, 4)}%`, backgroundColor: row.color }
            : { height: "3px", backgroundColor: row.color, opacity: 0.35 };
        const tooltip = `${row.label}: ${row.count} lead${row.count === 1 ? "" : "s"} (${pct}%)${row.detail ? `, ${row.detail}` : ""}. Click to see these leads.`;
        return (
          <Link
            key={row.label}
            href={row.href ?? "/admin"}
            title={tooltip}
            className="flex-1 flex flex-col items-center rounded-lg px-1.5 py-1.5 -mx-1.5 hover:bg-stone-50 transition-colors"
          >
            <div className="flex flex-col items-center justify-end h-40 w-full border-b border-stone-200">
              <span className="text-xs font-semibold text-stone-700 tabular-nums mb-1">{row.count}</span>
              <div className="w-full max-w-14 rounded-t-[4px]" style={style} />
            </div>
            <div className="mt-2 text-center">
              <span
                className="inline-block w-2 h-2 rounded-full mr-1 align-middle"
                style={{ backgroundColor: row.color }}
              />
              <span className="text-xs text-stone-500 leading-tight align-middle">{row.label}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function BreakdownCard({
  title,
  subtitle,
  rows,
  total,
}: {
  title: string;
  subtitle: string;
  rows: (Row & { href: string })[];
  total: number;
}) {
  const max = Math.max(...rows.map((row) => row.count), 1);
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
      <p className="text-sm font-semibold text-stone-900">{title}</p>
      <p className="text-xs text-stone-500 mt-0.5 mb-6">{subtitle}</p>
      <div className="flex items-start gap-4">
        {rows.map((row) => {
          const pct = total > 0 ? Math.round((row.count / total) * 100) : 0;
          const heightPct = Math.max((row.count / max) * 100, 4);
          return (
            <Link
              key={row.label}
              href={row.href}
              title={`${row.label}: ${row.count} lead${row.count === 1 ? "" : "s"} (${pct}%). Click to see these leads.`}
              className="flex-1 flex flex-col items-center rounded-lg px-1.5 py-1.5 -mx-1.5 hover:bg-stone-50 transition-colors"
            >
              <div className="flex flex-col items-center justify-end h-40 w-full border-b border-stone-200">
                <span className="text-xs font-semibold text-stone-700 tabular-nums mb-1">{row.count}</span>
                <div
                  className="w-full max-w-14 rounded-t-[4px] bg-amber-500 hover:bg-amber-600 transition-colors"
                  style={{ height: `${heightPct}%` }}
                />
              </div>
              <p className="text-xs text-stone-500 leading-tight mt-2 text-center">{row.label}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
