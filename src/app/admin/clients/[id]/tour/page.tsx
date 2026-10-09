import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TourRoutePlannerLoader } from "@/components/TourRoutePlannerLoader";

export default async function ClientTourPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await prisma.client.findUnique({ where: { id } });

  if (!client) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link
            href={`/admin/clients/${client.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 rounded-md px-2 py-1.5 -ml-2 hover:bg-neutral-100 transition"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                clipRule="evenodd"
              />
            </svg>
            Back to {client.name}
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">Plan {client.name.split(" ")[0]}&apos;s tour route</h1>
          <p className="text-sm text-neutral-500">
            Enter the addresses you&apos;re touring today and get an efficient visiting order.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
          <TourRoutePlannerLoader />
        </div>
      </main>
    </div>
  );
}
