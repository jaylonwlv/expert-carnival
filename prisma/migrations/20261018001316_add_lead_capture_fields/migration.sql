-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "smsConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "smsConsentAt" TIMESTAMP(3),
ADD COLUMN     "source" TEXT;
