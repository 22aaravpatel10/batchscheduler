-- AlterTable
ALTER TABLE "Batch" ADD COLUMN     "reactionStepId" TEXT,
ADD COLUMN     "reactionStepName" TEXT;

-- AlterTable
ALTER TABLE "Equipment" ADD COLUMN     "equipmentId" TEXT,
ADD COLUMN     "manufacturer" TEXT,
ADD COLUMN     "materialOfConstruction" TEXT,
ADD COLUMN     "size" TEXT;
