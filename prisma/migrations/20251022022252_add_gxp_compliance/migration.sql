-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Default Organization',
    "gxpMode" TEXT NOT NULL DEFAULT 'OFF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GxPConfig" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL DEFAULT 'default',
    "gxpMode" TEXT NOT NULL DEFAULT 'OFF',
    "applyToSites" TEXT[],
    "applyToProducts" TEXT[],
    "immutableAudit" BOOLEAN NOT NULL DEFAULT false,
    "requireReasonOnEdit" TEXT NOT NULL DEFAULT 'OFF',
    "lateEntryMinutes" INTEGER NOT NULL DEFAULT 5,
    "hashChainEnabled" BOOLEAN NOT NULL DEFAULT false,
    "logPrintExport" BOOLEAN NOT NULL DEFAULT false,
    "maxClockDrift" INTEGER NOT NULL DEFAULT 0,
    "clockDriftAction" TEXT NOT NULL DEFAULT 'NONE',
    "ntpEndpoint" TEXT,
    "ntpLastSync" TIMESTAMP(3),
    "versioningEnabled" BOOLEAN NOT NULL DEFAULT false,
    "approvedOnlyEnforcement" TEXT NOT NULL DEFAULT 'OFF',
    "effectiveDatingAllowed" BOOLEAN NOT NULL DEFAULT true,
    "changeReasonRequired" BOOLEAN NOT NULL DEFAULT false,
    "coaRequirement" TEXT NOT NULL DEFAULT 'OFF',
    "statusTransitionMatrix" JSONB,
    "calibrationOverdueAction" TEXT NOT NULL DEFAULT 'OFF',
    "cleaningMatrixEnabled" BOOLEAN NOT NULL DEFAULT false,
    "incompatibleSequenceAction" TEXT NOT NULL DEFAULT 'OFF',
    "auditRetentionYears" INTEGER NOT NULL DEFAULT 5,
    "batchRetentionYears" INTEGER NOT NULL DEFAULT 5,
    "masterRetentionYears" INTEGER NOT NULL DEFAULT 5,
    "exportSchedule" TEXT NOT NULL DEFAULT 'WEEKLY',
    "storageClass" TEXT NOT NULL DEFAULT 'STANDARD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GxPConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" BIGSERIAL NOT NULL,
    "tsServer" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tsClient" TIMESTAMP(3),
    "orgId" TEXT NOT NULL DEFAULT 'default',
    "userId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "beforeJson" JSONB,
    "afterJson" JSONB,
    "reasonCode" TEXT,
    "reasonText" TEXT,
    "sourceIp" TEXT,
    "userAgent" TEXT,
    "sessionId" TEXT,
    "hash" TEXT,
    "hashPrev" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReasonCode" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL DEFAULT 'default',
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReasonCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialMaster" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL DEFAULT 'default',
    "materialId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "spec" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "supersedesVersion" INTEGER,
    "changedBy" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "reasonCode" TEXT,
    "reasonText" TEXT,

    CONSTRAINT "MaterialMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryLot" (
    "id" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "lotNumber" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "qualityStatus" TEXT NOT NULL DEFAULT 'QUARANTINE',
    "coaAttached" BOOLEAN NOT NULL DEFAULT false,
    "coaFile" TEXT,
    "receivedDate" TIMESTAMP(3),
    "expirationDate" TIMESTAMP(3),
    "storageLocation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryLot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentCalibration" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "calibrationType" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "completedDate" TIMESTAMP(3),
    "completedBy" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DUE',
    "certificate" TEXT,
    "nextDueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EquipmentCalibration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GxPConfig_orgId_key" ON "GxPConfig"("orgId");

-- CreateIndex
CREATE INDEX "AuditLog_tsServer_idx" ON "AuditLog"("tsServer");

-- CreateIndex
CREATE INDEX "AuditLog_orgId_idx" ON "AuditLog"("orgId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_idx" ON "AuditLog"("entityType");

-- CreateIndex
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "ReasonCode_orgId_idx" ON "ReasonCode"("orgId");

-- CreateIndex
CREATE INDEX "ReasonCode_active_idx" ON "ReasonCode"("active");

-- CreateIndex
CREATE UNIQUE INDEX "ReasonCode_orgId_code_key" ON "ReasonCode"("orgId", "code");

-- CreateIndex
CREATE INDEX "MaterialMaster_orgId_idx" ON "MaterialMaster"("orgId");

-- CreateIndex
CREATE INDEX "MaterialMaster_materialId_idx" ON "MaterialMaster"("materialId");

-- CreateIndex
CREATE INDEX "MaterialMaster_status_idx" ON "MaterialMaster"("status");

-- CreateIndex
CREATE UNIQUE INDEX "MaterialMaster_materialId_version_key" ON "MaterialMaster"("materialId", "version");

-- CreateIndex
CREATE INDEX "InventoryLot_materialId_idx" ON "InventoryLot"("materialId");

-- CreateIndex
CREATE INDEX "InventoryLot_qualityStatus_idx" ON "InventoryLot"("qualityStatus");

-- CreateIndex
CREATE INDEX "InventoryLot_lotNumber_idx" ON "InventoryLot"("lotNumber");

-- CreateIndex
CREATE INDEX "EquipmentCalibration_equipmentId_idx" ON "EquipmentCalibration"("equipmentId");

-- CreateIndex
CREATE INDEX "EquipmentCalibration_status_idx" ON "EquipmentCalibration"("status");

-- CreateIndex
CREATE INDEX "EquipmentCalibration_dueDate_idx" ON "EquipmentCalibration"("dueDate");
