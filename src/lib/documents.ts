import { issueSignedToken, presignUrl, put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

export async function getSignedDownloadUrl(pathname: string): Promise<string> {
  const signedToken = await issueSignedToken({
    pathname,
    operations: ["get"],
  });

  const { presignedUrl } = await presignUrl(signedToken, {
    operation: "get",
    pathname,
    access: "private",
  });

  return presignedUrl;
}

export const MAX_FILES_PER_UPLOAD = 5;

export async function createDocumentsForClient({
  clientId,
  files,
  visibleToClient,
  uploadedBy,
  stageIndex,
}: {
  clientId: string;
  files: File[];
  visibleToClient: boolean;
  uploadedBy: "admin" | "client";
  stageIndex?: number | null;
}): Promise<string[]> {
  const filenames: string[] = [];

  for (const file of files) {
    const blob = await put(`clients/${clientId}/${file.name}`, file, {
      access: "private",
      addRandomSuffix: true,
    });

    await prisma.document.create({
      data: {
        clientId,
        filename: file.name,
        blobUrl: blob.url,
        pathname: blob.pathname,
        contentType: file.type || null,
        size: file.size,
        visibleToClient,
        uploadedBy,
        stageIndex: stageIndex ?? null,
      },
    });

    filenames.push(file.name);
  }

  return filenames;
}
