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
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-neutral-900">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white text-neutral-900 font-bold text-sm">
              RE
            </div>
            <h1 className="text-lg font-semibold text-white">Relocation Engine</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/clients/new"
              className="text-sm font-medium bg-white text-neutral-900 rounded-md px-3.5 py-2 hover:bg-neutral-100 transition shadow-sm hover:shadow-md"
            >
              + Add client
            </Link>
            <form action={logout}>
              <button type="submit" className="text-sm font-medium text-white/70 hover:text-white">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Total clients" value={clients.length} />
          <StatCard label="Active" value={active} accent="text-green-700" />
          <StatCard label="Moved in" value={movedIn} accent="text-green-900" />
        </div>

        <ClientList clients={clients} deleteAction={deleteClient} />
      </main>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p className={`text-2xl font-semibold mt-1 ${accent ?? "text-neutral-900"}`}>{value}</p>
    </div>
  );
}
