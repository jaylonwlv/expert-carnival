import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { STAGES } from "@/lib/stages";
import { Stepper } from "@/components/Stepper";

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
  const firstName = client.name.split(" ")[0];

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <p className="text-sm font-semibold text-neutral-900">{COMPANY_NAME}</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">
            {firstName}&apos;s move to Las Vegas
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Step {client.currentStage + 1} of {STAGES.length} · {stage.title}
          </p>
        </div>

        <section className="bg-white rounded-xl border border-neutral-200 p-5 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Right now
          </p>
          <p className="text-sm text-neutral-800">{client.note || stage.summary}</p>
          <div className="pt-2 border-t border-neutral-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-1">
              What&apos;s next
            </p>
            <p className="text-sm text-neutral-800">{stage.nextSteps}</p>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-neutral-200 p-5">
          <Stepper stages={STAGES} currentIndex={client.currentStage} />
        </section>

        {client.documents.length > 0 && (
          <section className="bg-white rounded-xl border border-neutral-200 p-5 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Your documents
            </p>
            <ul className="space-y-1">
              {client.documents.map((doc) => (
                <li key={doc.id}>
                  <a
                    href={doc.blobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-neutral-900 hover:underline"
                  >
                    {doc.filename}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {AGENT_PHONE && (
          <section className="bg-white rounded-xl border border-neutral-200 p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-neutral-900">
                Questions? Reach {AGENT_NAME}
              </p>
              <p className="text-xs text-neutral-500">We&apos;re here for anything you need.</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <a
                href={`sms:${AGENT_PHONE}`}
                className="rounded-md bg-neutral-900 text-white text-sm font-medium px-3 py-2 hover:bg-neutral-800"
              >
                Text
              </a>
              <a
                href={`tel:${AGENT_PHONE}`}
                className="rounded-md border border-neutral-300 text-neutral-800 text-sm font-medium px-3 py-2 hover:bg-neutral-50"
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
