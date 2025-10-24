-- CreateTable
CREATE TABLE "DCSIntegration" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "systemType" TEXT NOT NULL,
    "connectionType" TEXT NOT NULL,
    "opcServerUrl" TEXT,
    "opcNamespace" TEXT,
    "opcUsername" TEXT,
    "opcPassword" TEXT,
    "apiBaseUrl" TEXT,
    "apiKey" TEXT,
    "apiAuthType" TEXT,
    "dbConnectionString" TEXT,
    "dbType" TEXT,
    "certificatePath" TEXT,
    "trustServerCert" BOOLEAN NOT NULL DEFAULT false,
    "networkZone" TEXT,
    "syncEnabled" BOOLEAN NOT NULL DEFAULT false,
    "syncInterval" INTEGER NOT NULL DEFAULT 60,
    "lastSyncTime" TIMESTAMP(3),
    "syncStatus" TEXT NOT NULL DEFAULT 'IDLE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DCSIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DCSTag" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "tagName" TEXT NOT NULL,
    "tagPath" TEXT,
    "description" TEXT,
    "dataType" TEXT NOT NULL,
    "unit" TEXT,
    "mappingType" TEXT NOT NULL,
    "equipmentId" TEXT,
    "materialId" TEXT,
    "batchId" TEXT,
    "customField" TEXT,
    "currentValue" TEXT,
    "lastReadTime" TIMESTAMP(3),
    "quality" TEXT,
    "alarmEnabled" BOOLEAN NOT NULL DEFAULT false,
    "highAlarmLimit" DOUBLE PRECISION,
    "lowAlarmLimit" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DCSTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DCSSyncHistory" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "syncStartTime" TIMESTAMP(3) NOT NULL,
    "syncEndTime" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "tagsRead" INTEGER NOT NULL DEFAULT 0,
    "tagsFailed" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DCSSyncHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DCSIntegration_vendor_idx" ON "DCSIntegration"("vendor");

-- CreateIndex
CREATE INDEX "DCSIntegration_syncEnabled_idx" ON "DCSIntegration"("syncEnabled");

-- CreateIndex
CREATE INDEX "DCSTag_integrationId_idx" ON "DCSTag"("integrationId");

-- CreateIndex
CREATE INDEX "DCSTag_tagName_idx" ON "DCSTag"("tagName");

-- CreateIndex
CREATE INDEX "DCSTag_mappingType_idx" ON "DCSTag"("mappingType");

-- CreateIndex
CREATE UNIQUE INDEX "DCSTag_integrationId_tagName_key" ON "DCSTag"("integrationId", "tagName");

-- CreateIndex
CREATE INDEX "DCSSyncHistory_integrationId_idx" ON "DCSSyncHistory"("integrationId");

-- CreateIndex
CREATE INDEX "DCSSyncHistory_syncStartTime_idx" ON "DCSSyncHistory"("syncStartTime");

-- AddForeignKey
ALTER TABLE "DCSTag" ADD CONSTRAINT "DCSTag_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "DCSIntegration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
