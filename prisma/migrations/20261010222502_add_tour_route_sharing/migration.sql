-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "tourSavedAt" TIMESTAMP(3),
ADD COLUMN     "tourStops" JSONB;
