import { prisma } from "@/lib/prisma";
import type { Signer } from "@/generated/prisma/client";

// A Document's signerId is a plain Server Action argument, not something
// Prisma's relation enforces against the Client the upload is actually
// scoped to -- without this, a caller could tag a document with any other
// client's signer id and nothing downstream would notice. Returns the
// signer so callers that also need its name (e.g. for an activity log
// message) don't have to re-fetch it.
export async function assertSignerBelongsToClient(signerId: string, clientId: string): Promise<Signer> {
  const signer = await prisma.signer.findUnique({ where: { id: signerId } });
  if (!signer || signer.clientId !== clientId) {
    throw new Error("Invalid signer");
  }
  return signer;
}
