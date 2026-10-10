"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createDocumentRecordsForClient, MAX_FILES_PER_UPLOAD, type UploadedBlobMeta } from "@/lib/documents";
import { assertSignerBelongsToClient } from "@/lib/signers";
import { logActivity } from "@/lib/activity";

export async function createClientDocumentRecords(
  token: string,
  signerId: string | null,
  blobs: UploadedBlobMeta[]
) {
  const client = await prisma.client.findUnique({ where: { token } });
  if (!client) {
    throw new Error("Client not found");
  }

  if (blobs.length === 0) {
    throw new Error("Choose at least one file to upload");
  }
  if (blobs.length > MAX_FILES_PER_UPLOAD) {
    throw new Error(`Choose at most ${MAX_FILES_PER_UPLOAD} files at once`);
  }
  if (signerId !== null) {
    await assertSignerBelongsToClient(signerId, client.id);
  }

  const filenames = await createDocumentRecordsForClient({
    clientId: client.id,
    blobs,
    visibleToClient: true,
    uploadedBy: "client",
    signerId,
  });

  await logActivity(client.id, `Client uploaded ${filenames.map((f) => `"${f}"`).join(", ")}.`);

  revalidatePath(`/track/${token}`);
  revalidatePath(`/admin/clients/${client.id}`);
  revalidatePath(`/admin/clients/${client.id}/documents`);
}
