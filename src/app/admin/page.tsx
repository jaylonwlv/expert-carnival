import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { STAGES } from "@/lib/stages";
import { logout } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const clients = await prisma.client.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-neutral-900">Relocation Engine · Clients</h1>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/clients/new"
              className="text-sm font-medium bg-neutral-900 text-white rounded-md px-3 py-1.5 hover:bg-neutral-800"
            >
              + Add client
            </Link>
            <form action={logout}>
              <button type="submit" className="text-sm text-neutral-500 hover:text-neutral-800">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {clients.length === 0 ? (
          <p className="text-sm text-neutral-500">No clients yet. Add your first client to get started.</p>
        ) : (
          <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100">
            {clients.map((client) => {
              const stage = STAGES[client.currentStage];
              return (
                <Link
                  key={client.id}
                  href={`/admin/clients/${client.id}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-neutral-50 transition"
                >
                  <div>
                    <p className="font-medium text-neutral-900">{client.name}</p>
                    <p className="text-sm text-neutral-500">{client.email || client.phone || "No contact info"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-neutral-900">{stage.title}</p>
                    <p className="text-xs text-neutral-400">
                      Step {client.currentStage + 1} of {STAGES.length}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
