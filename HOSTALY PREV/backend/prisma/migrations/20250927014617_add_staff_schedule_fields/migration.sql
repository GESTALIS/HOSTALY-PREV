-- AlterTable
ALTER TABLE "ServiceSchedule" ADD COLUMN     "isStaffClosed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "staffEndTime" TEXT,
ADD COLUMN     "staffStartTime" TEXT;
