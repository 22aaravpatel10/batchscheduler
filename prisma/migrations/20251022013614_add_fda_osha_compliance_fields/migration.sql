-- AlterTable
ALTER TABLE "Material" ADD COLUMN     "casNumber" TEXT,
ADD COLUMN     "disposalProcedure" TEXT,
ADD COLUMN     "expirationDate" TIMESTAMP(3),
ADD COLUMN     "firstAidMeasures" TEXT,
ADD COLUMN     "ghsClassification" TEXT,
ADD COLUMN     "hazardCategory" TEXT,
ADD COLUMN     "hazardStatements" TEXT,
ADD COLUMN     "isHazardous" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lotNumber" TEXT,
ADD COLUMN     "pictograms" TEXT,
ADD COLUMN     "precautionaryStatements" TEXT,
ADD COLUMN     "qcApprovedBy" TEXT,
ADD COLUMN     "qcApprovedDate" TIMESTAMP(3),
ADD COLUMN     "qcStatus" TEXT DEFAULT 'PENDING',
ADD COLUMN     "receivedDate" TIMESTAMP(3),
ADD COLUMN     "requiresPPE" TEXT,
ADD COLUMN     "sdsFileName" TEXT,
ADD COLUMN     "sdsLastUpdated" TIMESTAMP(3),
ADD COLUMN     "signalWord" TEXT,
ADD COLUMN     "storageConditions" TEXT,
ADD COLUMN     "storageLocation" TEXT,
ADD COLUMN     "supplierLotNumber" TEXT,
ADD COLUMN     "supplierName" TEXT;

-- CreateIndex
CREATE INDEX "Material_casNumber_idx" ON "Material"("casNumber");

-- CreateIndex
CREATE INDEX "Material_qcStatus_idx" ON "Material"("qcStatus");

-- CreateIndex
CREATE INDEX "Material_expirationDate_idx" ON "Material"("expirationDate");
