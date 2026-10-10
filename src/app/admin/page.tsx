import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { STAGES } from "@/lib/stages";
import { ClientList } from "@/components/ClientList";
import { deleteClient, logout } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const clients = await prisma.client.findMany({
    orderBy: { updatedAt: "desc" },
  });

  const movedIn = clients.filter((c) => c.currentStage === STAGES.length - 1).length;
  const active = clients.length - movedIn;

  return (
    <div className="min-h-screen bg-[#faf8f4]">
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Image src="/logo.png" alt="Relocation Engine LLC" width={680} height={546} className="h-14 w-auto" priority />
          <div className="flex items-center gap-4">
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
          <StatCard label="Total clients" value={clients.length} icon={<PeopleIcon />} chip="bg-amber-50 text-amber-700" />
          <StatCard label="Active" value={active} icon={<ClockIcon />} chip="bg-sky-50 text-sky-700" />
          <StatCard label="Moved in" value={movedIn} icon={<HomeIcon />} chip="bg-emerald-50 text-emerald-700" />
        </div>

        <ClientList clients={clients} deleteAction={deleteClient} />
      </main>
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
