-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "signerId" TEXT;

-- CreateTable
CREATE TABLE "Signer" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Signer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Signer_clientId_idx" ON "Signer"("clientId");

-- CreateIndex
CREATE INDEX "Document_signerId_idx" ON "Document"("signerId");

-- AddForeignKey
ALTER TABLE "Signer" ADD CONSTRAINT "Signer_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_signerId_fkey" FOREIGN KEY ("signerId") REFERENCES "Signer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
