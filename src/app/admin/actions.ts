"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE } from "@/lib/auth";
import { STAGES } from "@/lib/stages";
import { createDocumentsForClient, MAX_FILES_PER_UPLOAD } from "@/lib/documents";
import { logActivity } from "@/lib/activity";
import { parseAppointmentInput, formatAppointment } from "@/lib/format";
import type { ChecklistStatus } from "@/lib/checklist";
import { allNeighborhoodNames } from "@/lib/neighborhoods";
import { sendEmail } from "@/lib/email";
import { CHECKLIST_EMAIL_TRIGGERS, STAGE_EMAIL_TRIGGERS } from "@/lib/emailTriggers";
import { buildTrackerUrl } from "@/lib/trackerUrl";

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

export async function createClient(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const isPCS = formData.get("isPCS") === "on";

  if (!name) {
    throw new Error("Name is required");
  }

  const client = await prisma.client.create({
    data: {
      name,
      email: email || null,
      phone: phone || null,
      token: nanoid(12),
      isPCS,
    },
  });

  await logActivity(client.id, isPCS ? "Client added (PCS relocation)." : "Client added.");

  revalidatePath("/admin");
  redirect(`/admin/clients/${client.id}`);
}

export async function updateStage(clientId: string, formData: FormData) {
  const stageIndex = Number(formData.get("currentStage"));
  if (!Number.isInteger(stageIndex) || stageIndex < 0 || stageIndex >= STAGES.length) {
    throw new Error("Invalid stage");
  }

  const stageTitle = STAGES[stageIndex].title;

  const client = await prisma.client.update({
    where: { id: clientId },
    data: { currentStage: stageIndex, stageUpdatedAt: new Date() },
  });

  await logActivity(clientId, `Stage changed to "${stageTitle}".`);

  const trigger = STAGE_EMAIL_TRIGGERS[stageTitle];
  if (trigger && client.email) {
    const trackerUrl = await buildTrackerUrl(client.token);
    await sendEmail({
      to: client.email,
      subject: trigger.subject,
      html: trigger.body(client.name.split(" ")[0], trackerUrl),
    });
    await logActivity(clientId, `Emailed ${client.name}: "${trigger.subject}".`);
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/clients/${clientId}`);
}

export async function updateNote(clientId: string, formData: FormData) {
  const note = String(formData.get("note") ?? "").trim();

  await prisma.client.update({
    where: { id: clientId },
    data: { note: note || null },
  });

  await logActivity(clientId, note ? "Custom update note changed." : "Custom update note cleared.");

  revalidatePath("/admin");
  revalidatePath(`/admin/clients/${clientId}`);
}

export async function updateAppointment(clientId: string, formData: FormData) {
  const raw = String(formData.get("appointmentAt") ?? "").trim();
  const appointmentAt = raw ? parseAppointmentInput(raw) : null;

  await prisma.client.update({
    where: { id: clientId },
    data: { appointmentAt },
  });

  await logActivity(
    clientId,
    appointmentAt
      ? `Upcoming appointment set to ${formatAppointment(appointmentAt)}.`
      : "Upcoming appointment cleared."
  );

  revalidatePath("/admin");
  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath(`/track`);
}

export async function deleteClient(clientId: string) {
  await prisma.client.delete({ where: { id: clientId } });
  revalidatePath("/admin");
  redirect("/admin");
}

export async function uploadDocument(clientId: string, formData: FormData) {
  const files = formData.getAll("file").filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length === 0) {
    throw new Error("Choose at least one file to upload");
  }
  if (files.length > MAX_FILES_PER_UPLOAD) {
    throw new Error(`Choose at most ${MAX_FILES_PER_UPLOAD} files at once`);
  }

  const visibleToClient = formData.get("visibleToClient") === "on";
  const rawStageIndex = formData.get("stageIndex");
  let stageIndex: number | null = null;
  if (rawStageIndex !== null && rawStageIndex !== "") {
    const parsed = Number(rawStageIndex);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed >= STAGES.length) {
      throw new Error("Invalid stage");
    }
    stageIndex = parsed;
  }

  const filenames = await createDocumentsForClient({
    clientId,
    files,
    visibleToClient,
    uploadedBy: "admin",
    stageIndex,
  });

  await logActivity(clientId, `Uploaded ${filenames.map((f) => `"${f}"`).join(", ")}.`);

  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath(`/admin/clients/${clientId}/documents`);
  revalidatePath(`/track`);
}

export async function deleteDocument(documentId: string) {
  const document = await prisma.document.findUnique({ where: { id: documentId } });
  if (!document) return;

  await del(document.blobUrl);
  await prisma.document.delete({ where: { id: documentId } });

  await logActivity(document.clientId, `Deleted document "${document.filename}".`);

  revalidatePath(`/admin/clients/${document.clientId}`);
  revalidatePath(`/admin/clients/${document.clientId}/documents`);
  revalidatePath(`/track`);
}

export async function toggleDocumentVisibility(documentId: string) {
  const document = await prisma.document.findUnique({ where: { id: documentId } });
  if (!document) return;

  const nowVisible = !document.visibleToClient;

  await prisma.document.update({
    where: { id: documentId },
    data: { visibleToClient: nowVisible },
  });

  await logActivity(
    document.clientId,
    nowVisible
      ? `Made "${document.filename}" visible to client.`
      : `Made "${document.filename}" admin-only.`
  );

  revalidatePath(`/admin/clients/${document.clientId}`);
  revalidatePath(`/admin/clients/${document.clientId}/documents`);
  revalidatePath(`/track`);
}

const CHECKLIST_STATUSES: ChecklistStatus[] = ["pending", "done", "not_needed"];

export async function setChecklistItemStatus(itemId: string, status: ChecklistStatus) {
  if (!CHECKLIST_STATUSES.includes(status)) {
    throw new Error("Invalid checklist status");
  }

  const item = await prisma.checklistItem.update({
    where: { id: itemId },
    data: { status, statusAt: new Date() },
    include: { client: true },
  });

  const message =
    status === "done"
      ? `Checked off "${item.label}".`
      : status === "not_needed"
        ? `Marked "${item.label}" as not needed.`
        : `Reopened "${item.label}".`;

  await logActivity(item.clientId, message);

  if (status === "done") {
    const trigger = CHECKLIST_EMAIL_TRIGGERS[item.key];
    if (trigger && item.client.email) {
      const trackerUrl = await buildTrackerUrl(item.client.token);
      await sendEmail({
        to: item.client.email,
        subject: trigger.subject,
        html: trigger.body(item.client.name.split(" ")[0], trackerUrl),
      });
      await logActivity(item.clientId, `Emailed ${item.client.name}: "${trigger.subject}".`);
    }
  }

  revalidatePath(`/admin/clients/${item.clientId}`);
}

export async function updateNeighborhoods(clientId: string, formData: FormData) {
  const allOptions = new Set(allNeighborhoodNames());
  const selected = formData.getAll("neighborhoods").filter(
    (value): value is string => typeof value === "string" && allOptions.has(value)
  );

  await prisma.client.update({
    where: { id: clientId },
    data: { preferredNeighborhoods: selected },
  });

  await logActivity(
    clientId,
    selected.length > 0
      ? `Preferred neighborhoods updated: ${selected.join(", ")}.`
      : "Preferred neighborhoods cleared."
  );

  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath(`/track`);
}

export async function toggleClientPCS(clientId: string) {
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) return;

  const nowPCS = !client.isPCS;

  await prisma.client.update({
    where: { id: clientId },
    data: { isPCS: nowPCS },
  });

  await logActivity(
    clientId,
    nowPCS ? "Marked as a PCS/military relocation." : "Unmarked as a PCS/military relocation."
  );

  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/admin");
}
