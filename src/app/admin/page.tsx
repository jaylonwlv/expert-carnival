import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { STAGES } from "@/lib/stages";
import { stageColor, avatarColor, initials } from "@/lib/stageColors";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
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
      <header className="bg-gradient-to-r from-indigo-600 to-violet-600">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/15 text-white font-bold text-sm">
              RE
            </div>
            <h1 className="text-lg font-semibold text-white">Relocation Engine</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/clients/new"
              className="text-sm font-medium bg-white text-indigo-700 rounded-md px-3.5 py-2 hover:bg-indigo-50 transition shadow-sm"
            >
              + Add client
            </Link>
            <form action={logout}>
              <button type="submit" className="text-sm font-medium text-white/80 hover:text-white">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Total clients" value={clients.length} />
          <StatCard label="Active" value={active} accent="text-indigo-600" />
          <StatCard label="Moved in" value={movedIn} accent="text-emerald-600" />
        </div>

        {clients.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 py-16 text-center">
            <p className="text-sm text-neutral-500">No clients yet. Add your first client to get started.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100 overflow-hidden">
            {clients.map((client) => {
              const stage = STAGES[client.currentStage];
              const color = stageColor(client.currentStage);
              const progress = ((client.currentStage + 1) / STAGES.length) * 100;
              return (
                <div
                  key={client.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-neutral-50 transition"
                >
                  <div
                    className={`flex items-center justify-center w-11 h-11 rounded-full ${avatarColor(client.name)} text-white text-sm font-semibold shrink-0`}
                  >
                    {initials(client.name)}
                  </div>
                  <Link href={`/admin/clients/${client.id}`} className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 truncate">{client.name}</p>
                    <p className="text-sm text-neutral-500 truncate">
                      {client.email || client.phone || "No contact info"}
                    </p>
                  </Link>
                  <Link href={`/admin/clients/${client.id}`} className="w-40 shrink-0 hidden sm:block">
                    <span
                      className={`inline-block text-xs font-semibold rounded-full px-2.5 py-1 mb-1.5 ${color.badgeBg} ${color.badgeText}`}
                    >
                      {stage.title}
                    </span>
                    <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${color.solidBg}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </Link>
                  <ConfirmSubmitButton
                    action={deleteClient.bind(null, client.id)}
                    confirmMessage={`Remove ${client.name}? This can't be undone.`}
                    label="Remove"
                  />
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4">
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p className={`text-2xl font-semibold mt-1 ${accent ?? "text-neutral-900"}`}>{value}</p>
    </div>
  );
}
