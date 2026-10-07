import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { STAGES } from "@/lib/stages";
import { stageColor, avatarColor, initials } from "@/lib/stageColors";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { SavedBanner } from "@/components/SavedBanner";
import {
  deleteClient,
  updateNote,
  updateStage,
  uploadDocument,
} from "../../actions";

export default async function ClientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;
  const client = await prisma.client.findUnique({
    where: { id },
    include: { documents: { orderBy: { createdAt: "desc" } } },
  });

  if (!client) {
    notFound();
  }

  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = host?.startsWith("localhost") || host?.startsWith("127.0.0.1") ? "http" : "https";
  const trackerUrl = `${protocol}://${host}/track/${client.token}`;

  const updateStageForClient = updateStage.bind(null, client.id);
  const updateNoteForClient = updateNote.bind(null, client.id);
  const deleteClientForClient = deleteClient.bind(null, client.id);
  const uploadDocumentForClient = uploadDocument.bind(null, client.id);

  const currentStageColor = stageColor(client.currentStage);

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 rounded-md px-2.5 py-2 -ml-2.5 hover:bg-neutral-100 transition"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                clipRule="evenodd"
              />
            </svg>
            Back to clients
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {saved && <SavedBanner saved={saved} />}

        <div className="flex items-center gap-4">
          <div
            className={`flex items-center justify-center w-14 h-14 rounded-full ${avatarColor(client.name)} text-white text-lg font-semibold shrink-0`}
          >
            {initials(client.name)}
          </div>
          <div>
            <h1 className="text-lg font-semibold text-neutral-900">{client.name}</h1>
            <p className="text-sm text-neutral-500">{client.email || "No email"} · {client.phone || "No phone"}</p>
          </div>
          <span
            className={`ml-auto text-xs font-semibold rounded-full px-3 py-1.5 ${currentStageColor.badgeBg} ${currentStageColor.badgeText}`}
          >
            {STAGES[client.currentStage].title}
          </span>
        </div>

        <section className="bg-white rounded-xl border border-neutral-200 p-6 space-y-3">
          <h2 className="text-sm font-semibold text-neutral-900">Client tracker link</h2>
          <p className="text-sm text-neutral-500">
            Send this link via your SMS/email automation so {client.name.split(" ")[0]} can check their progress anytime.
          </p>
          <CopyLinkButton url={trackerUrl} />
        </section>

        <section className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-neutral-900">Pipeline</h2>
          <form action={updateStageForClient}>
            <div className="flex flex-wrap gap-1.5">
              {STAGES.map((stage, index) => {
                const color = stageColor(index);
                const isDone = index < client.currentStage;
                const isCurrent = index === client.currentStage;
                return (
                  <button
                    key={stage.title}
                    type="submit"
                    name="currentStage"
                    value={index}
                    title={stage.summary}
                    className={`text-xs font-medium px-3 py-2 rounded-lg transition ${
                      isDone || isCurrent
                        ? `${color.solidBg} ${color.solidText}`
                        : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                    } ${isCurrent ? `ring-2 ring-offset-2 ${color.ring}` : ""}`}
                  >
                    {index + 1}. {stage.title}
                  </button>
                );
              })}
            </div>
          </form>
          <p className="text-sm text-neutral-500 pt-2 border-t border-neutral-100">
            {STAGES[client.currentStage].summary}
          </p>
        </section>

        <section className="bg-white rounded-xl border border-neutral-200 p-6 space-y-3">
          <h2 className="text-sm font-semibold text-neutral-900">Custom update (optional)</h2>
          <p className="text-sm text-neutral-500">
            Overrides the default &ldquo;what&apos;s happening now&rdquo; text on the client&apos;s tracker with something specific.
          </p>
          <form action={updateNoteForClient} className="space-y-3">
            <textarea
              name="note"
              rows={3}
              defaultValue={client.note ?? ""}
              placeholder="e.g. Inspection is scheduled for Thursday at 10am."
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
            <button
              type="submit"
              className="rounded-md bg-neutral-900 text-white text-sm font-medium px-4 py-2 hover:bg-neutral-800"
            >
              Save update
            </button>
          </form>
        </section>

        <section className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Documents</h2>
              <p className="text-sm text-neutral-500">
                {client.documents.length} {client.documents.length === 1 ? "file" : "files"} · contracts, IDs,
                financial paperwork, closing documents.
              </p>
            </div>
            <Link
              href={`/admin/clients/${client.id}/documents`}
              className="shrink-0 text-sm font-medium bg-neutral-900 text-white rounded-md px-3 py-2 hover:bg-neutral-800"
            >
              View client documents
            </Link>
          </div>

          <form action={uploadDocumentForClient} className="space-y-3 pt-3 border-t border-neutral-100">
            <input
              type="file"
              name="file"
              required
              multiple
              className="block w-full text-sm text-neutral-900 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-900 file:text-white file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-neutral-800"
            />
            <p className="text-xs text-neutral-400">Up to 5 files at once.</p>
            <label className="flex items-center gap-2 text-sm text-neutral-700">
              <input type="checkbox" name="visibleToClient" className="rounded" />
              Visible to client on their tracker page
            </label>
            <button
              type="submit"
              className="rounded-md bg-neutral-900 text-white text-sm font-medium px-4 py-2 hover:bg-neutral-800"
            >
              Upload document(s)
            </button>
          </form>
        </section>

        <section className="bg-white rounded-xl border border-red-200 p-6">
          <h2 className="text-sm font-semibold text-red-700 mb-2">Remove client</h2>
          <p className="text-sm text-neutral-500 mb-3">
            Deletes this client and their tracker link permanently.
          </p>
          <form action={deleteClientForClient}>
            <button
              type="submit"
              className="rounded-md border border-red-300 text-red-700 text-sm font-medium px-4 py-2 hover:bg-red-50"
            >
              Delete client
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
