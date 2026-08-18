-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "MasterListItem" (
    "id" TEXT NOT NULL,
    "plantId" TEXT NOT NULL,
    "listKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MasterListItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportSubmission" (
    "id" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "plantId" TEXT NOT NULL,
    "operator" TEXT,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MasterListItem_plantId_listKey_idx" ON "MasterListItem"("plantId", "listKey");

-- CreateIndex
CREATE UNIQUE INDEX "MasterListItem_plantId_listKey_label_key" ON "MasterListItem"("plantId", "listKey", "label");

-- CreateIndex
CREATE INDEX "ReportSubmission_plantId_reportType_createdAt_idx" ON "ReportSubmission"("plantId", "reportType", "createdAt");

