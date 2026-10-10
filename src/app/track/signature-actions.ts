"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getSignedDownloadUrl } from "@/lib/documents";
import { stampSignedPdf, type FieldToStamp } from "@/lib/signature";
import { logActivity } from "@/lib/activity";
import { sendEmail } from "@/lib/email";

async function clientIp(): Promise<string | null> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() ?? null;
}

export async function submitSignature(
  requestId: string,
  values: Record<string, string>,
  signerName: string
) {
  const request = await prisma.signatureRequest.findUnique({
    where: { id: requestId },
    include: { document: true, client: true, fields: true },
  });

  if (!request) {
    throw new Error("Signature request not found");
  }
  if (request.status === "signed") {
    throw new Error("This document has already been signed");
  }
  if (!signerName.trim()) {
    throw new Error("Name is required");
  }

  const requiredFields = request.fields.filter((f) => f.type !== "checkbox");
  const missing = requiredFields.some((f) => !values[f.id] || values[f.id].trim() === "");
  if (missing) {
    throw new Error("Please fill in every field before submitting");
  }

  await prisma.$transaction(
    request.fields.map((field) =>
      prisma.signatureField.update({
        where: { id: field.id },
        data: { value: values[field.id] ?? (field.type === "checkbox" ? "false" : null) },
      })
    )
  );

  const sourceUrl = await getSignedDownloadUrl(request.document.pathname);
  const sourceRes = await fetch(sourceUrl);
  if (!sourceRes.ok) {
    throw new Error("Could not load the original document");
  }
  const sourceBytes = new Uint8Array(await sourceRes.arrayBuffer());

  const fieldsToStamp: FieldToStamp[] = request.fields.map((field) => ({
    type: field.type as FieldToStamp["type"],
    page: field.page,
    xPct: field.xPct,
    yPct: field.yPct,
    widthPct: field.widthPct,
    heightPct: field.heightPct,
    value: values[field.id] ?? (field.type === "checkbox" ? "false" : null),
  }));

  const ip = await clientIp();
  const signedAt = new Date();

  const signedPdfBytes = await stampSignedPdf(sourceBytes, fieldsToStamp, {
    signerName: signerName.trim(),
    signedAt,
    signedIp: ip,
    documentFilename: request.document.filename,
  });

  const signedFilename = `Signed - ${request.document.filename}`;
  const pathname = `clients/${request.clientId}/${signedFilename}`;
  const blob = await put(pathname, Buffer.from(signedPdfBytes), {
    access: "private",
    addRandomSuffix: true,
    contentType: "application/pdf",
  });

  const signedDocument = await prisma.document.create({
    data: {
      clientId: request.clientId,
      filename: signedFilename,
      blobUrl: blob.url,
      pathname: blob.pathname,
      contentType: "application/pdf",
      size: signedPdfBytes.byteLength,
      visibleToClient: true,
      uploadedBy: "client",
    },
  });

  await prisma.signatureRequest.update({
    where: { id: requestId },
    data: {
      status: "signed",
      signedAt,
      signedByName: signerName.trim(),
      signedIp: ip,
      signedDocumentId: signedDocument.id,
    },
  });

  await logActivity(request.clientId, `Signed "${request.document.filename}".`);

  const agentEmail = process.env.AGENT_EMAIL;
  if (agentEmail) {
    await sendEmail({
      to: agentEmail,
      subject: `${request.client.name} signed "${request.document.filename}"`,
      html: `<p>${request.client.name} just signed "${request.document.filename}". The signed copy is in their document gallery.</p>`,
    });
  }

  revalidatePath(`/track/${request.client.token}`);
  revalidatePath(`/track/${request.client.token}/sign/${requestId}`);
  revalidatePath(`/admin/clients/${request.clientId}`);
  revalidatePath(`/admin/clients/${request.clientId}/documents`);
}
