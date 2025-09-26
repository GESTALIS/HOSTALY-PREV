-- CreateEnum
CREATE TYPE "FlexibilityType" AS ENUM ('STANDARD', 'PART_TIME');

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "flexibilityType" "FlexibilityType" NOT NULL DEFAULT 'STANDARD',
ADD COLUMN     "maxWeeklyHours" INTEGER DEFAULT 35,
ADD COLUMN     "minWeeklyHours" INTEGER DEFAULT 0,
ADD COLUMN     "preferredShifts" TEXT[] DEFAULT ARRAY[]::TEXT[];
