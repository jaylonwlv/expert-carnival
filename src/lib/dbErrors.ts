import { Prisma } from "@/generated/prisma/client";

// With the @prisma/adapter-pg driver adapter this project uses, a database
// that's unreachable doesn't come through as PrismaClientInitializationError
// (what plain, non-adapter Prisma Client throws for the same failure) --
// it surfaces as a PrismaClientKnownRequestError whose code falls in the
// P1xxx range, Prisma's own documented range for connection-level errors
// (P1001 "Can't reach database server", P1002 "timed out", P1017 "server
// has closed the connection", etc.), as opposed to P2xxx query-engine
// errors or P3xxx migration errors. Verified directly against this
// project's actual adapter setup rather than assumed from Prisma's
// non-adapter docs, since the two didn't match.
export function isDatabaseConnectivityError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) return true;
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code.startsWith("P1");
}
