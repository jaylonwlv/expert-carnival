-- AlterTable
ALTER TABLE "SignatureRequest" ADD COLUMN     "idAcknowledgedAt" TIMESTAMP(3),
ADD COLUMN     "requiresIdAcknowledgment" BOOLEAN NOT NULL DEFAULT false;
