"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { logActivity } from "@/lib/activity";
import { sendEmail, escapeHtml } from "@/lib/email";
import { buildTrackerUrl } from "@/lib/trackerUrl";
import type { PlacedFieldPayload } from "@/lib/signatureFields";

export async function createSignatureRequest(
  documentId: string,
  fields: PlacedFieldPayload[],
  requiresIdAcknowledgment: boolean
) {
  if (fields.length === 0) {
    throw new Error("Place at least one field before sending");
  }

  const document = await prisma.document.findUnique({ where: { id: documentId }, include: { client: true } });
  if (!document) {
    throw new Error("Document not found");
  }

  try {
    await prisma.signatureRequest.create({
      data: {
        documentId: document.id,
        clientId: document.clientId,
        requiresIdAcknowledgment,
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
  } catch (err) {
    // documentId is @unique -- opening the same document's sign-setup page
    // in two tabs, or double-clicking "Send" before the page revalidates,
    // both see "no request yet" and both submit. Without this, the second
    // call throws a raw Prisma constraint error straight at the admin.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new Error("A signature request already exists for this document");
    }
    throw err;
  }

  await logActivity(document.clientId, `Requested signature on "${document.filename}".`);

  if (document.client.email) {
    const trackerUrl = await buildTrackerUrl(document.client.token);
    await sendEmail({
      to: document.client.email,
      subject: "A document is waiting for your signature",
      html: `<p>Hi ${escapeHtml(document.client.name.split(" ")[0])},</p><p>A document ("${escapeHtml(document.filename)}") is ready for your signature.</p><p><a href="${trackerUrl}">Review and sign</a></p>`,
    });
  }

  revalidatePath(`/admin/clients/${document.clientId}`);
  revalidatePath(`/admin/clients/${document.clientId}/documents`);
  revalidatePath(`/track/${document.client.token}`);
}
