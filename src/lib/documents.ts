import { issueSignedToken, presignUrl } from "@vercel/blob";
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

// A file's bytes go straight from the browser to Vercel Blob (see
// src/app/api/blob-upload/route.ts) -- by the time a Document row is
// created, all we have left is this metadata, not the file itself.
export type UploadedBlobMeta = {
  filename: string;
  pathname: string;
  url: string;
  contentType: string | null;
  size: number;
};

// The context a browser passes to /api/blob-upload so it can authorize the
// upload; shared with that route so the two sides can't drift apart.
export type UploadAuthContext =
  | { kind: "admin"; clientId: string }
  | { kind: "client"; token: string; clientId: string };

// A pathname's "clients/<id>/" prefix proves which client it belongs to,
// but the filename after it comes straight from the uploaded File's own
// .name with no sanitization. Blob storage treats the whole string as an
// opaque key rather than a resolved filesystem path, so a stray "/" or ".."
// in a filename isn't known to let one client's upload collide with
// another's real blob -- but there's no reason to let a filename produce
// anything other than a single flat segment under that prefix, so this
// rejects the possibility outright rather than relying on that assumption.
export function isSafeDocumentPathname(pathname: string, clientId: string): boolean {
  const prefix = `clients/${clientId}/`;
  if (!pathname.startsWith(prefix)) return false;
  const rest = pathname.slice(prefix.length);
  return rest.length > 0 && !rest.includes("/") && !rest.includes("..");
}

export async function createDocumentRecordsForClient({
  clientId,
  blobs,
  visibleToClient,
  uploadedBy,
  stageIndex,
}: {
  clientId: string;
  blobs: UploadedBlobMeta[];
  visibleToClient: boolean;
  uploadedBy: "admin" | "client";
  stageIndex?: number | null;
}): Promise<string[]> {
  const filenames: string[] = [];

  for (const blob of blobs) {
    // The /api/blob-upload route only lets a browser mint an upload token
    // scoped to this client's prefix, but this function takes plain
    // metadata as a Server Action argument -- without re-checking it here,
    // nothing stops a caller from claiming a pathname (and therefore a
    // blob) that actually belongs to a different client.
    if (!isSafeDocumentPathname(blob.pathname, clientId)) {
      throw new Error("Invalid document reference");
    }

    await prisma.document.create({
      data: {
        clientId,
        filename: blob.filename,
        blobUrl: blob.url,
        pathname: blob.pathname,
        contentType: blob.contentType,
        size: blob.size,
        visibleToClient,
        uploadedBy,
        stageIndex: stageIndex ?? null,
      },
    });

    filenames.push(blob.filename);
  }

  return filenames;
}
