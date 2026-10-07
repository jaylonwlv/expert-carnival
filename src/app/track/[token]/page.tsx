import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { STAGES } from "@/lib/stages";
import { stageColor } from "@/lib/stageColors";
import { formatFileSize, fileKindLabel } from "@/lib/format";
import { Stepper } from "@/components/Stepper";
import { FileTypeIcon } from "@/components/FileTypeIcon";
import { getSignedDownloadUrl } from "@/lib/documents";

const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME ?? "Relocation Engine";
const AGENT_NAME = process.env.NEXT_PUBLIC_AGENT_NAME ?? "your agent";
const AGENT_PHONE = process.env.NEXT_PUBLIC_AGENT_PHONE;

export default async function TrackPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const client = await prisma.client.findUnique({
    where: { token },
    include: { documents: { where: { visibleToClient: true }, orderBy: { createdAt: "desc" } } },
  });

  if (!client) {
    notFound();
  }

  const stage = STAGES[client.currentStage];
  const color = stageColor(client.currentStage);
  const firstName = client.name.split(" ")[0];

  const documents = await Promise.all(
    client.documents.map(async (doc) => ({
      ...doc,
      downloadUrl: await getSignedDownloadUrl(doc.pathname),
    }))
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-neutral-900">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white text-neutral-900 font-bold text-xs">
            RE
          </div>
          <p className="text-sm font-semibold text-white">{COMPANY_NAME}</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">
              {firstName}&apos;s move to Las Vegas
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Step {client.currentStage + 1} of {STAGES.length}
            </p>
          </div>
          <span
            className={`shrink-0 text-xs font-semibold rounded-full px-3 py-1.5 ${color.badgeBg} ${color.badgeText}`}
          >
            {stage.title}
          </span>
        </div>

        <section className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className={`h-1.5 ${color.solidBg}`} />
          <div className="p-5 space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-1">
                Right now
              </p>
              <p className="text-sm text-neutral-800">{client.note || stage.summary}</p>
            </div>
            <div className="pt-3 border-t border-neutral-100">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-1">
                What&apos;s next
              </p>
              <p className="text-sm text-neutral-800">{stage.nextSteps}</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5">
          <Stepper stages={STAGES} currentIndex={client.currentStage} />
        </section>

        {documents.length > 0 && (
          <section className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Your documents
            </p>
            <ul className="divide-y divide-neutral-100">
              {documents.map((doc) => (
                <li key={doc.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <FileTypeIcon kind={fileKindLabel(doc.contentType, doc.filename)} size="sm" />
                  <a
                    href={doc.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-sm font-medium text-neutral-900 hover:underline truncate"
                  >
                    {doc.filename}
                  </a>
                  <span className="text-xs text-neutral-400 shrink-0">{formatFileSize(doc.size)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {AGENT_PHONE && (
          <section className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-neutral-900">
                Questions? Reach {AGENT_NAME}
              </p>
              <p className="text-xs text-neutral-500">We&apos;re here for anything you need.</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <a
                href={`sms:${AGENT_PHONE}`}
                className="rounded-md bg-neutral-900 text-white text-sm font-medium px-3 py-2 shadow-sm hover:shadow-md hover:bg-neutral-800 transition"
              >
                Text
              </a>
              <a
                href={`tel:${AGENT_PHONE}`}
                className="rounded-md border border-neutral-300 bg-white text-neutral-800 text-sm font-medium px-3 py-2 shadow-sm hover:shadow-md hover:bg-neutral-50 transition"
              >
                Call
              </a>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
