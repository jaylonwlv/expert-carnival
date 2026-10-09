import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { STAGES } from "@/lib/stages";
import { stageColor, avatarColor, initials } from "@/lib/stageColors";
import { timeAgo, formatAppointment, toAppointmentInputValue } from "@/lib/format";
import { ensureChecklistItems, STAGE_CHECKLISTS, type ChecklistStatus } from "@/lib/checklist";
import { NEIGHBORHOOD_GROUPS } from "@/lib/neighborhoods";
import { buildTrackerUrl } from "@/lib/trackerUrl";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { ActionForm } from "@/components/ActionForm";
import { FileDropzone } from "@/components/FileDropzone";
import { ChecklistAccordion, type ChecklistStageData } from "@/components/ChecklistAccordion";
import { PCSBadge } from "@/components/PCSBadge";
import {
  deleteClient,
  setChecklistItemStatus,
  toggleClientPCS,
  updateAppointment,
  updateNeighborhoods,
  updateNote,
  updateStage,
  uploadDocument,
} from "../../actions";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      documents: { orderBy: { createdAt: "desc" } },
      activityLog: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!client) {
    notFound();
  }

  await ensureChecklistItems(client.id, client.isPCS);
  const checklistItems = await prisma.checklistItem.findMany({
    where: { clientId: client.id },
    orderBy: [{ stageIndex: "asc" }, { sortOrder: "asc" }],
  });

  const trackerUrl = await buildTrackerUrl(client.token);

  const updateStageForClient = updateStage.bind(null, client.id);
  const updateNoteForClient = updateNote.bind(null, client.id);
  const deleteClientForClient = deleteClient.bind(null, client.id);
  const uploadDocumentForClient = uploadDocument.bind(null, client.id);
  const updateAppointmentForClient = updateAppointment.bind(null, client.id);
  const updateNeighborhoodsForClient = updateNeighborhoods.bind(null, client.id);
  const toggleClientPCSForClient = toggleClientPCS.bind(null, client.id);

  const currentStageColor = stageColor(client.currentStage);

  const NEIGHBORHOODS_STAGE_TITLE = "Home & Area Selection";
  const TOUR_STAGE_TITLE = "Touring Homes";

  const checklistStages: ChecklistStageData[] = STAGES.map((stage, index) => ({
    index,
    title: stage.title,
    summary: stage.summary,
    documentHeavy: STAGE_CHECKLISTS[index].documentHeavy,
    showNeighborhoods: stage.title === NEIGHBORHOODS_STAGE_TITLE,
    showTourLink: stage.title === TOUR_STAGE_TITLE,
    items: checklistItems
      .filter((item) => item.stageIndex === index)
      .map((item) => ({
        id: item.id,
        label: item.label,
        status: item.status as ChecklistStatus,
        statusAt: item.statusAt,
      })),
    documentCount: client.documents.filter((doc) => doc.stageIndex === index).length,
  }));

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
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center justify-center w-14 h-14 rounded-full ${avatarColor(client.name)} text-white text-lg font-semibold shrink-0 shadow-sm`}
          >
            {initials(client.name)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-neutral-900">{client.name}</h1>
              {client.isPCS && <PCSBadge />}
            </div>
            <p className="text-sm text-neutral-500">{client.email || "No email"} · {client.phone || "No phone"}</p>
            <form action={toggleClientPCSForClient}>
              <button type="submit" className="text-xs text-neutral-400 hover:text-neutral-600 hover:underline">
                {client.isPCS ? "Remove PCS tag" : "Mark as PCS relocation"}
              </button>
            </form>
          </div>
          <span
            className={`ml-auto text-xs font-semibold rounded-full px-3 py-1.5 ${currentStageColor.badgeBg} ${currentStageColor.badgeText}`}
          >
            {STAGES[client.currentStage].title}
          </span>
        </div>

        <section className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-3">
          <h2 className="text-sm font-semibold text-neutral-900">Client tracker link</h2>
          <p className="text-sm text-neutral-500">
            Send this link via your SMS/email automation so {client.name.split(" ")[0]} can check their progress anytime.
          </p>
          <CopyLinkButton url={trackerUrl} />
        </section>

        <section className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-semibold text-neutral-900">Pipeline</h2>
          <ActionForm action={updateStageForClient} toastMessage="Stage updated.">
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
                        ? `${color.solidBg} ${color.solidText} shadow-sm`
                        : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                    } ${isCurrent ? `ring-2 ring-offset-2 ${color.ring} shadow-md` : ""}`}
                  >
                    {index + 1}. {stage.title}
                  </button>
                );
              })}
            </div>
          </ActionForm>
          <p className="text-sm text-neutral-500 pt-2 border-t border-neutral-100">
            {STAGES[client.currentStage].summary}
          </p>
        </section>

        <section className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-neutral-900 mb-1">Checklist</h2>
          <p className="text-sm text-neutral-500 mb-2">
            Steps for each stage. Mark a step &ldquo;not needed&rdquo; if it doesn&apos;t apply to this client.
          </p>
          <ChecklistAccordion
            stages={checklistStages}
            currentStageIndex={client.currentStage}
            documentsHref={`/admin/clients/${client.id}/documents`}
            tourHref={`/admin/clients/${client.id}/tour`}
            onSetStatus={setChecklistItemStatus}
            uploadAction={uploadDocumentForClient}
            neighborhoods={{ groups: NEIGHBORHOOD_GROUPS, selected: client.preferredNeighborhoods }}
            updateNeighborhoodsAction={updateNeighborhoodsForClient}
          />
        </section>

        <section className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-3">
          <h2 className="text-sm font-semibold text-neutral-900">Upcoming appointment</h2>
          <p className="text-sm text-neutral-500">
            {client.appointmentAt ? (
              <>
                Currently set to{" "}
                <span className="font-medium text-neutral-800">{formatAppointment(client.appointmentAt)}</span>.
                Shown on {client.name.split(" ")[0]}&apos;s tracker page.
              </>
            ) : (
              "No appointment scheduled."
            )}
          </p>
          <ActionForm action={updateAppointmentForClient} toastMessage="Appointment updated." className="flex items-end gap-3">
            <div className="flex-1">
              <label htmlFor="appointmentAt" className="block text-xs font-medium text-neutral-500 mb-1">
                Date &amp; time
              </label>
              <input
                id="appointmentAt"
                type="datetime-local"
                name="appointmentAt"
                defaultValue={client.appointmentAt ? toAppointmentInputValue(client.appointmentAt) : ""}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-neutral-900 text-white text-sm font-medium px-4 py-2 shadow-sm hover:shadow-md hover:bg-neutral-800 transition"
            >
              Save
            </button>
          </ActionForm>
          {client.appointmentAt && (
            <form action={updateAppointmentForClient}>
              <input type="hidden" name="appointmentAt" value="" />
              <button type="submit" className="text-xs text-red-600 hover:underline">
                Clear appointment
              </button>
            </form>
          )}
        </section>

        <section className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-3">
          <h2 className="text-sm font-semibold text-neutral-900">Custom update (optional)</h2>
          <p className="text-sm text-neutral-500">
            Overrides the default &ldquo;what&apos;s happening now&rdquo; text on the client&apos;s tracker with something specific.
          </p>
          <ActionForm action={updateNoteForClient} toastMessage="Update saved." className="space-y-3">
            <textarea
              name="note"
              rows={3}
              defaultValue={client.note ?? ""}
              placeholder="e.g. Inspection is scheduled for Thursday at 10am."
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
            <button
              type="submit"
              className="rounded-md bg-neutral-900 text-white text-sm font-medium px-4 py-2 shadow-sm hover:shadow-md hover:bg-neutral-800 transition"
            >
              Save update
            </button>
          </ActionForm>
        </section>

        <section className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-4">
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
              className="shrink-0 text-sm font-medium bg-neutral-900 text-white rounded-md px-3 py-2 shadow-sm hover:shadow-md hover:bg-neutral-800 transition"
            >
              View client documents
            </Link>
          </div>

          <ActionForm
            action={uploadDocumentForClient}
            toastMessage="Document(s) uploaded."
            className="space-y-3 pt-3 border-t border-neutral-100"
          >
            <FileDropzone name="file" maxFiles={5} />
            <label className="flex items-center gap-2 text-sm text-neutral-700">
              <input type="checkbox" name="visibleToClient" className="rounded" />
              Visible to client on their tracker page
            </label>
            <button
              type="submit"
              className="rounded-md bg-neutral-900 text-white text-sm font-medium px-4 py-2 shadow-sm hover:shadow-md hover:bg-neutral-800 transition"
            >
              Upload document(s)
            </button>
          </ActionForm>
        </section>

        <section className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-3">
          <h2 className="text-sm font-semibold text-neutral-900">Activity</h2>
          {client.activityLog.length === 0 ? (
            <p className="text-sm text-neutral-500">No activity yet.</p>
          ) : (
            <ul className="space-y-2.5 max-h-80 overflow-y-auto">
              {client.activityLog.map((entry) => (
                <li key={entry.id} className="flex items-start gap-3 text-sm">
                  <span className="text-neutral-400 shrink-0 w-14 text-right">{timeAgo(entry.createdAt)}</span>
                  <span className="text-neutral-700">{entry.message}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white rounded-xl border border-red-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-red-700 mb-2">Remove client</h2>
          <p className="text-sm text-neutral-500 mb-3">
            Deletes this client and their tracker link permanently.
          </p>
          <form action={deleteClientForClient}>
            <button
              type="submit"
              className="rounded-md border border-red-300 text-red-700 text-sm font-medium px-4 py-2 shadow-sm hover:shadow-md hover:bg-red-50 transition"
            >
              Delete client
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
