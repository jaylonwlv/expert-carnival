"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createDocumentsForClient, MAX_FILES_PER_UPLOAD } from "@/lib/documents";
import { logActivity } from "@/lib/activity";

export async function uploadClientDocument(token: string, formData: FormData) {
  const client = await prisma.client.findUnique({ where: { token } });
  if (!client) {
    throw new Error("Client not found");
  }

  const files = formData.getAll("file").filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length === 0) {
    throw new Error("Choose at least one file to upload");
  }
  if (files.length > MAX_FILES_PER_UPLOAD) {
    throw new Error(`Choose at most ${MAX_FILES_PER_UPLOAD} files at once`);
  }

  const filenames = await createDocumentsForClient({
    clientId: client.id,
    files,
    visibleToClient: true,
    uploadedBy: "client",
  });

  await logActivity(client.id, `Client uploaded ${filenames.map((f) => `"${f}"`).join(", ")}.`);

  revalidatePath(`/track/${token}`);
  revalidatePath(`/admin/clients/${client.id}`);
  revalidatePath(`/admin/clients/${client.id}/documents`);
}
