"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { sendEmail } from "@/lib/email";
import { buildTrackerUrl } from "@/lib/trackerUrl";
import type { PlacedFieldPayload } from "@/lib/signatureFields";

export async function createSignatureRequest(documentId: string, fields: PlacedFieldPayload[]) {
  if (fields.length === 0) {
    throw new Error("Place at least one field before sending");
  }

  const document = await prisma.document.findUnique({ where: { id: documentId }, include: { client: true } });
  if (!document) {
    throw new Error("Document not found");
  }

  await prisma.signatureRequest.create({
    data: {
      documentId: document.id,
      clientId: document.clientId,
      fields: {
        create: fields.map((f) => ({
          type: f.type,
          page: f.page,
          xPct: f.xPct,
          yPct: f.yPct,
          widthPct: f.widthPct,
          heightPct: f.heightPct,
          label: f.label ?? null,
          sortOrder: f.sortOrder,
        })),
      },
    },
  });

  await logActivity(document.clientId, `Requested signature on "${document.filename}".`);

  if (document.client.email) {
    const trackerUrl = await buildTrackerUrl(document.client.token);
    await sendEmail({
      to: document.client.email,
      subject: "A document is waiting for your signature",
      html: `<p>Hi ${document.client.name.split(" ")[0]},</p><p>A document ("${document.filename}") is ready for your signature.</p><p><a href="${trackerUrl}">Review and sign</a></p>`,
    });
  }

  revalidatePath(`/admin/clients/${document.clientId}`);
  revalidatePath(`/admin/clients/${document.clientId}/documents`);
  revalidatePath(`/track/${document.client.token}`);
}
