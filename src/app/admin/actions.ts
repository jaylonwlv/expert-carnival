"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { put, del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE } from "@/lib/auth";
import { STAGES } from "@/lib/stages";

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

export async function createClient(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!name) {
    throw new Error("Name is required");
  }

  const client = await prisma.client.create({
    data: {
      name,
      email: email || null,
      phone: phone || null,
      token: nanoid(12),
    },
  });

  revalidatePath("/admin");
  redirect(`/admin/clients/${client.id}`);
}

export async function updateStage(clientId: string, formData: FormData) {
  const stageIndex = Number(formData.get("currentStage"));
  if (!Number.isInteger(stageIndex) || stageIndex < 0 || stageIndex >= STAGES.length) {
    throw new Error("Invalid stage");
  }

  await prisma.client.update({
    where: { id: clientId },
    data: { currentStage: stageIndex, stageUpdatedAt: new Date() },
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/clients/${clientId}`);
}

export async function updateNote(clientId: string, formData: FormData) {
  const note = String(formData.get("note") ?? "").trim();

  await prisma.client.update({
    where: { id: clientId },
    data: { note: note || null },
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/clients/${clientId}`);
}

export async function deleteClient(clientId: string) {
  await prisma.client.delete({ where: { id: clientId } });
  revalidatePath("/admin");
  redirect("/admin");
}

export async function uploadDocument(clientId: string, formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose a file to upload");
  }

  const visibleToClient = formData.get("visibleToClient") === "on";

  const blob = await put(`clients/${clientId}/${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  await prisma.document.create({
    data: {
      clientId,
      filename: file.name,
      blobUrl: blob.url,
      contentType: file.type || null,
      size: file.size,
      visibleToClient,
    },
  });

  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath(`/track`);
}

export async function deleteDocument(documentId: string) {
  const document = await prisma.document.findUnique({ where: { id: documentId } });
  if (!document) return;

  await del(document.blobUrl);
  await prisma.document.delete({ where: { id: documentId } });

  revalidatePath(`/admin/clients/${document.clientId}`);
}

export async function toggleDocumentVisibility(documentId: string) {
  const document = await prisma.document.findUnique({ where: { id: documentId } });
  if (!document) return;

  await prisma.document.update({
    where: { id: documentId },
    data: { visibleToClient: !document.visibleToClient },
  });

  revalidatePath(`/admin/clients/${document.clientId}`);
}
