import { prisma } from "@/lib/prisma";

export async function logActivity(clientId: string, message: string) {
  await prisma.activityLog.create({
    data: { clientId, message },
  });
}
