"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getSignedDownloadUrl } from "@/lib/documents";
import { stampSignedPdf, type FieldToStamp } from "@/lib/signature";
import { logActivity } from "@/lib/activity";
import { sendEmail, escapeHtml } from "@/lib/email";

async function clientIp(): Promise<string | null> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() ?? null;
}

export async function submitSignature(
  requestId: string,
  token: string,
  values: Record<string, string>,
  signerName: string
) {
  const request = await prisma.signatureRequest.findUnique({
    where: { id: requestId },
    include: { document: true, client: true, fields: true },
  });

  if (!request || request.client.token !== token) {
    throw new Error("Signature request not found");
  }
  if (!signerName.trim()) {
    throw new Error("Name is required");
  }

  const requiredFields = request.fields.filter((f) => f.type !== "checkbox");
  const missing = requiredFields.some((f) => !values[f.id] || values[f.id].trim() === "");
  if (missing) {
    throw new Error("Please fill in every field before submitting");
  }

  // Atomically claim the request before doing any expensive work, so two
  // concurrent submissions (double-click, two open tabs) can't both pass the
  // "not yet signed" check and race to overwrite each other's audit data.
  // Only pending/viewed requests can be claimed -- "signing" is excluded so a
  // second concurrent call can't also claim it once the first flips it.
  const claim = await prisma.signatureRequest.updateMany({
    where: { id: requestId, status: { in: ["pending", "viewed"] } },
    data: { status: "signing" },
  });
  if (claim.count === 0) {
    throw new Error("This document has already been signed");
  }

  try {
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
        html: `<p>${escapeHtml(request.client.name)} just signed "${escapeHtml(request.document.filename)}". The signed copy is in their document gallery.</p>`,
      });
    }

    revalidatePath(`/track/${request.client.token}`);
    revalidatePath(`/track/${request.client.token}/sign/${requestId}`);
    revalidatePath(`/admin/clients/${request.clientId}`);
    revalidatePath(`/admin/clients/${request.clientId}/documents`);
  } catch (err) {
    // Release the claim so the client can retry after a transient failure
    // (e.g. a blob upload hiccup) instead of being locked out forever.
    await prisma.signatureRequest.updateMany({
      where: { id: requestId, status: "signing" },
      data: { status: request.status },
    });
    throw err;
  }
}
