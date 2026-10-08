-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "preferredNeighborhoods" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "stageIndex" INTEGER;

-- CreateTable
CREATE TABLE "ChecklistItem" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "stageIndex" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "statusAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChecklistItem_clientId_idx" ON "ChecklistItem"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistItem_clientId_key_key" ON "ChecklistItem"("clientId", "key");

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
