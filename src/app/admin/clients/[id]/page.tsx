import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { STAGES } from "@/lib/stages";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { deleteClient, updateNote, updateStage } from "../../actions";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await prisma.client.findUnique({ where: { id } });

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

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link href="/admin" className="text-sm text-neutral-500 hover:text-neutral-800">
            ← Back to clients
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">{client.name}</h1>
          <p className="text-sm text-neutral-500">{client.email || "No email"} · {client.phone || "No phone"}</p>
        </div>

        <section className="bg-white rounded-xl border border-neutral-200 p-6 space-y-3">
          <h2 className="text-sm font-semibold text-neutral-900">Client tracker link</h2>
          <p className="text-sm text-neutral-500">
            Send this link via your SMS/email automation so {client.name.split(" ")[0]} can check their progress anytime.
          </p>
          <CopyLinkButton url={trackerUrl} />
        </section>

        <section className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-neutral-900">Current stage</h2>
          <form action={updateStageForClient} className="space-y-3">
            <div className="grid gap-2">
              {STAGES.map((stage, index) => (
                <label
                  key={stage.title}
                  className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition ${
                    index === client.currentStage
                      ? "border-neutral-900 bg-neutral-50"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="currentStage"
                    value={index}
                    defaultChecked={index === client.currentStage}
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-sm font-medium text-neutral-900">
                      {index + 1}. {stage.title}
                    </span>
                    <span className="block text-xs text-neutral-500">{stage.summary}</span>
                  </span>
                </label>
              ))}
            </div>
            <button
              type="submit"
              className="rounded-md bg-neutral-900 text-white text-sm font-medium px-4 py-2 hover:bg-neutral-800"
            >
              Save stage
            </button>
          </form>
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
