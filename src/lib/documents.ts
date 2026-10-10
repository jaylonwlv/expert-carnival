import { issueSignedToken, presignUrl, head, del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

// Vercel Blob's default signed-URL lifetime is 1 hour, which is tight for a
// real estate workflow: a client might open a signing link, get pulled away
// mid-review, and come back hours later to find the PDF has stopped loading
// (pdf.js can still be fetching later pages of a multi-page document well
// after the page's initial load). 72 hours gives documents days, not
// minutes, to actually get reviewed and signed before a link goes stale.
const SIGNED_URL_LIFETIME_MS = 72 * 60 * 60 * 1000;

// Every page that lists documents (the gallery, the client tracker, the
// signing view) calls this once per document on every render, and each call
// is two sequential round trips to Vercel's Blob control API -- that's real,
// externally-imposed latency on pages that otherwise only touch our own DB.
// Since a signed URL is now valid for 72 hours, regenerating one on every
// single page load was pure waste; this reuses one already in flight within
// that window instead. The margin below just keeps a URL from expiring in
// the gap between being handed to the browser and actually being fetched --
// it doesn't change what's servable, only how often this re-asks Vercel for
// something it already knows the answer to.
const CACHE_RENEWAL_MARGIN_MS = 10 * 60 * 1000;
const MAX_CACHED_URLS = 10_000;
const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();

export async function getSignedDownloadUrl(pathname: string): Promise<string> {
  const cached = signedUrlCache.get(pathname);
  if (cached && Date.now() < cached.expiresAt - CACHE_RENEWAL_MARGIN_MS) {
    return cached.url;
  }

  const validUntil = Date.now() + SIGNED_URL_LIFETIME_MS;
  const signedToken = await issueSignedToken({
    pathname,
    operations: ["get"],
    validUntil,
  });

  const { presignedUrl } = await presignUrl(signedToken, {
    operation: "get",
    pathname,
    access: "private",
  });

  if (signedUrlCache.size > MAX_CACHED_URLS) {
    signedUrlCache.clear();
  }
  signedUrlCache.set(pathname, { url: presignedUrl, expiresAt: validUntil });

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
  signerId,
}: {
  clientId: string;
  blobs: UploadedBlobMeta[];
  visibleToClient: boolean;
  uploadedBy: "admin" | "client";
  stageIndex?: number | null;
  signerId?: string | null;
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

    // blob.url/size/contentType are the browser's own unverified report of
    // what it uploaded -- deleteDocument later calls del() on whatever
    // blobUrl is stored here, so trusting a fabricated url outright would
    // turn a crafted Document row into a "delete any blob in the store"
    // primitive. head() asks Vercel directly what's actually at this
    // pathname and is what gets persisted instead.
    //
    // It also doubles as the only way to catch a tampered upload that
    // requested public access: the client (not this server) is the one
    // that tells Vercel whether a blob is public or private at upload time
    // (access isn't part of the signed upload token this app issues), so
    // the real url -- which embeds ".public." or ".private." in its host
    // -- is the only authoritative signal available after the fact.
    let realBlob;
    try {
      realBlob = await head(blob.pathname);
    } catch {
      throw new Error("Could not verify the uploaded file");
    }

    if (!new URL(realBlob.url).hostname.includes(".private.")) {
      await del(realBlob.url).catch(() => {});
      throw new Error("Upload was not stored privately and has been removed");
    }

    await prisma.document.create({
      data: {
        clientId,
        filename: blob.filename,
        blobUrl: realBlob.url,
        pathname: blob.pathname,
        contentType: realBlob.contentType || null,
        size: realBlob.size,
        visibleToClient,
        uploadedBy,
        stageIndex: stageIndex ?? null,
        signerId: signerId ?? null,
      },
    });

    filenames.push(blob.filename);
  }

  return filenames;
}
