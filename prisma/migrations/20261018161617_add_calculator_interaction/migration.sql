-- CreateTable
CREATE TABLE "CalculatorInteraction" (
    "id" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "income" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalculatorInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CalculatorInteraction_page_idx" ON "CalculatorInteraction"("page");
