import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { STAGES } from "@/lib/stages";
import { ClientList } from "@/components/ClientList";
import { DatabaseUnavailable } from "@/components/DatabaseUnavailable";
import { isDatabaseConnectivityError } from "@/lib/dbErrors";
import { deleteClient, logCallOutcomeFromForm, logout } from "./actions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; stage?: string }>;
}) {
  const params = await searchParams;
  const query = (params.q ?? "").trim();

  // Both of these come straight off the URL, which a bookmark, a shared
  // link, or just hand-editing the address bar can put anything into -- an
  // unparseable or out-of-range value has to fall back to a sane default
  // rather than reach Prisma, which rejects a non-integer Int filter (NaN,
  // a float, an out-of-range stage) by throwing instead of matching nothing.
  const parsedStage = Number(params.stage);
  const stageFilter =
    params.stage !== undefined &&
    Number.isInteger(parsedStage) &&
    parsedStage >= 0 &&
    parsedStage < STAGES.length
      ? params.stage!
      : "all";

  const parsedPage = Number(params.page);
  const requestedPage = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const where: Prisma.ClientWhereInput = {
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { phone: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(stageFilter !== "all" ? { currentStage: Number(stageFilter) } : {}),
  };

  // This is the first thing almost any admin session touches right after
  // login, so a database that's unreachable shows up here as "login is
  // broken" -- catching it here and saying so directly is the only way to
  // say that: a thrown error reaching the root error.tsx boundary instead
  // would just show a generic "Something went wrong", since Next.js (and
  // React, on top of it) redacts the real server-side error before it
  // reaches the browser in production.
  let totalClients: number,
    movedIn: number,
    filteredCount: number,
    clients: Awaited<ReturnType<typeof prisma.client.findMany>>,
    leadsByType: { california: number; pcs: number };
  try {
    // The stat cards always reflect every client, independent of the
    // search box/stage filter below them, so they're counted separately
    // from the (possibly filtered) list. Grouping by isPCS is scoped to
    // source: { not: null } -- that's what tells an actual lead-form
    // submission apart from a client Paulin added by hand, who shouldn't
    // count here either way.
    let rawLeadsByType;
    [totalClients, movedIn, filteredCount, rawLeadsByType] = await Promise.all([
      prisma.client.count(),
      prisma.client.count({ where: { currentStage: STAGES.length - 1 } }),
      prisma.client.count({ where }),
      prisma.client.groupBy({ by: ["isPCS"], where: { source: { not: null } }, _count: { _all: true } }),
    ]);
    leadsByType = {
      california: rawLeadsByType.find((r) => !r.isPCS)?._count._all ?? 0,
      pcs: rawLeadsByType.find((r) => r.isPCS)?._count._all ?? 0,
    };

    // Clamp instead of trusting the URL's ?page= as-is -- otherwise
    // narrowing a search/stage filter while on a later page would skip
    // past the end of the now-smaller result set and silently render
    // nothing.
    const totalPagesForQuery = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));
    const clampedPage = Math.min(requestedPage, totalPagesForQuery);

    clients = await prisma.client.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (clampedPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    });
  } catch (error) {
    if (!isDatabaseConnectivityError(error)) throw error;
    const retryParams = new URLSearchParams();
    if (params.q) retryParams.set("q", params.q);
    if (params.stage) retryParams.set("stage", params.stage);
    if (params.page) retryParams.set("page", params.page);
    const qs = retryParams.toString();
    return <DatabaseUnavailable retryHref={qs ? `/admin?${qs}` : "/admin"} />;
  }
  const active = totalClients - movedIn;
  const totalPages = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);

  return (
    <div className="min-h-screen bg-[#faf8f4]">
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Image src="/logo.png" alt="Relocation Engine LLC" width={680} height={546} className="h-20 w-auto" priority />
          <div className="flex items-center gap-4">
            <Link
              href="/admin/analytics"
              className="text-sm font-medium text-stone-500 hover:text-stone-800 transition"
            >
              Analytics Center
            </Link>
            <Link
              href="/admin/clients/new"
              className="text-sm font-medium bg-amber-600 text-white rounded-lg px-4 py-2.5 hover:bg-amber-700 transition shadow-sm hover:shadow-md"
            >
              + Add client
            </Link>
            <form action={logout}>
              <button type="submit" className="text-sm font-medium text-stone-500 hover:text-stone-800 transition">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div className="grid grid-cols-3 gap-5">
          <StatCard label="Total clients" value={totalClients} icon={<PeopleIcon />} chip="bg-amber-50 text-amber-700" />
          <StatCard label="Active" value={active} icon={<ClockIcon />} chip="bg-sky-50 text-sky-700" />
          <StatCard label="Moved in" value={movedIn} icon={<HomeIcon />} chip="bg-emerald-50 text-emerald-700" />
        </div>

        <LeadsByType leads={leadsByType} />

        <ClientList
          clients={clients}
          deleteAction={deleteClient}
          logCallOutcomeAction={logCallOutcomeFromForm}
          query={query}
          stageFilter={stageFilter}
          page={page}
          totalPages={totalPages}
          hasAnyClients={totalClients > 0}
        />
      </main>
    </div>
  );
}

// At-a-glance split of lead-form submissions by relocation type -- isPCS
// is what each landing page actually sets based on which one the visitor
// came through (optin = PCS, homepage/california = standard), not a
// separate field to keep in sync (see submitLead in app/lead-actions.ts).
function LeadsByType({ leads }: { leads: { california: number; pcs: number } }) {
  const total = leads.california + leads.pcs;
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
      <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">
        Leads by type
      </p>
      {total === 0 ? (
        <p className="text-sm text-stone-400">No lead-form submissions yet.</p>
      ) : (
        <div className="flex flex-wrap gap-8">
          <div>
            <p className="text-2xl font-semibold text-stone-900 tabular-nums">{total}</p>
            <p className="text-xs text-stone-500">Total leads</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-stone-900 tabular-nums">{leads.california}</p>
            <p className="text-xs text-stone-500">California</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-stone-900 tabular-nums">{leads.pcs}</p>
            <p className="text-xs text-stone-500">PCS</p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  chip,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  chip: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm hover:shadow-md transition">
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${chip} mb-3`}>{icon}</div>
      <p className="text-3xl font-semibold text-stone-900 tabular-nums">{value}</p>
      <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mt-1">{label}</p>
    </div>
  );
}

function PeopleIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <circle cx="7" cy="6" r="3" />
      <path d="M1.5 17c0-3.5 2.5-6 5.5-6s5.5 2.5 5.5 6v.5h-11V17z" />
      <circle cx="14.5" cy="7.5" r="2.4" opacity="0.55" />
      <path d="M11.8 17c.3-2.6 1.6-4.6 3.3-5.4 2.1.6 3.7 2.8 3.9 5.4v.5h-7.2V17z" opacity="0.55" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
      <circle cx="10" cy="10" r="7.25" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6.25V10l2.75 1.75" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path d="M10 2.5l7.5 6.1V17a1 1 0 01-1 1h-4v-6h-5v6h-4a1 1 0 01-1-1V8.6l7.5-6.1z" />
    </svg>
  );
}
