import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, isValidSessionToken } from "@/lib/auth";
import { isSafeDocumentPathname, type UploadAuthContext } from "@/lib/documents";

// Documents can be several MB (scanned contracts, phone photos); uploading
// them straight from the browser to Blob storage, rather than through a
// Server Action, is what lets this bypass the ~4.5mb request body ceiling
// Vercel enforces on Serverless Functions.
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!clientPayload) {
          throw new Error("Missing upload context");
        }
        const context = JSON.parse(clientPayload) as UploadAuthContext;

        // The admin session cookie and the client's own tracker token are
        // the two things this app treats as proof of identity elsewhere
        // (src/proxy.ts and the track pages, respectively) -- re-derive the
        // authorized clientId from one of those here rather than trusting
        // whatever clientId the browser sent, so a tampered payload can't
        // point this token at someone else's folder.
        let authorizedClientId: string;
        if (context.kind === "admin") {
          const cookieStore = await cookies();
          if (!isValidSessionToken(cookieStore.get(SESSION_COOKIE)?.value)) {
            throw new Error("Not authorized");
          }
          authorizedClientId = context.clientId;
        } else {
          const client = await prisma.client.findUnique({ where: { token: context.token } });
          if (!client) {
            throw new Error("Not authorized");
          }
          authorizedClientId = client.id;
        }

        if (!isSafeDocumentPathname(pathname, authorizedClientId)) {
          throw new Error("Invalid upload path");
        }

        return {
          addRandomSuffix: true,
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 }
    );
  }
}
