import { prisma } from "@/lib/prisma";

// A Document's signerId is a plain Server Action argument, not something
// Prisma's relation enforces against the Client the upload is actually
// scoped to -- without this, a caller could tag a document with any other
// client's signer id and nothing downstream would notice.
export async function assertSignerBelongsToClient(signerId: string, clientId: string): Promise<void> {
  const signer = await prisma.signer.findUnique({ where: { id: signerId } });
  if (!signer || signer.clientId !== clientId) {
    throw new Error("Invalid signer");
  }
}
