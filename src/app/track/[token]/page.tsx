import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { STAGES } from "@/lib/stages";
import { stageColor } from "@/lib/stageColors";
import { formatFileSize, fileKindLabel, formatAppointment } from "@/lib/format";
import { Stepper } from "@/components/Stepper";
import { FileTypeIcon } from "@/components/FileTypeIcon";
import { DocumentUploadForm } from "@/components/DocumentUploadForm";
import { TourRouteMapLoader } from "@/components/TourRouteMapLoader";
import { getSignedDownloadUrl } from "@/lib/documents";
import { createClientDocumentRecords } from "../actions";
import type { TourStop } from "../../admin/actions";

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
    include: {
      documents: { where: { visibleToClient: true }, orderBy: { createdAt: "desc" } },
      signatureRequests: {
        where: { status: { in: ["pending", "viewed"] } },
        include: { document: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!client) {
    notFound();
  }

  const stage = STAGES[client.currentStage];
  const color = stageColor(client.currentStage);
  const firstName = client.name.split(" ")[0];
  const uploadForClient = createClientDocumentRecords.bind(null, token);
  const tourStops = client.tourStops as TourStop[] | null;

  const documents = await Promise.all(
    client.documents.map(async (doc) => ({
      ...doc,
      downloadUrl: await getSignedDownloadUrl(doc.pathname),
    }))
  );

  return (
    <div className="min-h-screen bg-[#faf8f4]">
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <Image src="/logo.png" alt={COMPANY_NAME} width={680} height={546} className="h-11 w-auto" priority />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        {client.signatureRequests.length > 0 && (
          <section className="bg-red-600 rounded-xl shadow-sm p-5 space-y-2">
            <p className="text-sm font-semibold text-white uppercase tracking-wide">Documents to be signed</p>
            <ul className="space-y-1.5">
              {client.signatureRequests.map((request) => (
                <li key={request.id}>
                  <Link
                    href={`/track/${token}/sign/${request.id}`}
                    className="text-sm font-medium text-white underline hover:text-red-100"
                  >
                    {request.document.filename}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-stone-900">
              {firstName}&apos;s move to Las Vegas
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              Step {client.currentStage + 1} of {STAGES.length}
            </p>
          </div>
          <span
            className={`shrink-0 text-xs font-semibold rounded-full px-3 py-1.5 ${color.badgeBg} ${color.badgeText}`}
          >
            {stage.title}
          </span>
        </div>

        {client.appointmentAt && (
          <section className="bg-amber-50 border border-amber-200 rounded-xl shadow-sm p-5 flex items-center gap-3">
            <svg className="w-5 h-5 text-amber-600 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5a1.25 1.25 0 00-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5a1.25 1.25 0 00-1.25-1.25H4.75z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                Upcoming appointment
              </p>
              <p className="text-sm font-medium text-amber-900">{formatAppointment(client.appointmentAt)}</p>
            </div>
          </section>
        )}

        <section className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <div className={`h-1.5 ${color.solidBg}`} />
          <div className="p-5 space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-1">
                Right now
              </p>
              <p className="text-sm text-stone-800">{client.note || stage.summary}</p>
              {client.preferredNeighborhoods.length > 0 && (
                <p className="text-sm text-stone-500 mt-1">
                  Targeting: {client.preferredNeighborhoods.join(", ")}
                </p>
              )}
            </div>
            <div className="pt-3 border-t border-stone-100">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-1">
                What&apos;s next
              </p>
              <p className="text-sm text-stone-800">{stage.nextSteps}</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
          <Stepper stages={STAGES} currentIndex={client.currentStage} />
        </section>

        {tourStops && tourStops.length >= 2 && (
          <section className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
              Your home tour route
            </p>
            <TourRouteMapLoader stops={tourStops} />
          </section>
        )}

        <section className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
            Documents
          </p>

          {documents.length > 0 && (
            <ul className="divide-y divide-stone-100">
              {documents.map((doc) => (
                <li key={doc.id} className="flex items-center gap-3 py-2.5 first:pt-0">
                  <FileTypeIcon kind={fileKindLabel(doc.contentType, doc.filename)} size="sm" />
                  <a
                    href={doc.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-sm font-medium text-stone-900 hover:underline truncate"
                  >
                    {doc.filename}
                  </a>
                  <span className="text-xs text-stone-400 shrink-0">{formatFileSize(doc.size)}</span>
                </li>
              ))}
            </ul>
          )}

          <p className="text-xs text-stone-500">
            Need to send something our way (ID, pay stubs, etc.)? Upload it here.
          </p>
          <DocumentUploadForm
            context={{ kind: "client", token, clientId: client.id }}
            onUpload={uploadForClient}
            submitLabel="Upload"
            className={`space-y-3 ${documents.length > 0 ? "pt-3 border-t border-stone-100" : ""}`}
          />
        </section>

        {AGENT_PHONE && (
          <section className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-stone-900">
                Questions? Reach {AGENT_NAME}
              </p>
              <p className="text-xs text-stone-500">We&apos;re here for anything you need.</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <a
                href={`sms:${AGENT_PHONE}`}
                className="rounded-md bg-amber-600 text-white text-sm font-medium px-3 py-2 shadow-sm hover:shadow-md hover:bg-amber-700 transition"
              >
                Text
              </a>
              <a
                href={`tel:${AGENT_PHONE}`}
                className="rounded-md border border-stone-300 bg-white text-stone-800 text-sm font-medium px-3 py-2 shadow-sm hover:shadow-md hover:bg-stone-50 transition"
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
