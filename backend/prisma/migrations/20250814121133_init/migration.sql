/*
  Warnings:

  - Added the required column `updatedAt` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('CDI', 'CDD', 'SAISONNIER', 'MI_TEMPS', 'EXTRA');

-- CreateEnum
CREATE TYPE "WeeklyHours" AS ENUM ('H35', 'H39', 'H35_MODULABLE', 'H39_MODULABLE');

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "color" TEXT NOT NULL DEFAULT '#eca08e',
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "SalaryGrid" (
    "id" SERIAL NOT NULL,
    "level" INTEGER NOT NULL,
    "echelon" INTEGER NOT NULL,
    "hourlyRate" DECIMAL(8,2) NOT NULL,
    "daysOff" INTEGER NOT NULL,
    "vacationDays" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryGrid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceSchedule" (
    "id" SERIAL NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "season" "Season" NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "openTime" TEXT NOT NULL,
    "closeTime" TEXT NOT NULL,
    "isHoliday" BOOLEAN NOT NULL DEFAULT false,
    "isException" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "mainServiceId" INTEGER NOT NULL,
    "contractType" "ContractType" NOT NULL,
    "weeklyHours" "WeeklyHours" NOT NULL,
    "salaryGridId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeePolyvalence" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeePolyvalence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeSchedule" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "breakTime" INTEGER NOT NULL DEFAULT 30,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeSchedule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ServiceSchedule" ADD CONSTRAINT "ServiceSchedule_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_mainServiceId_fkey" FOREIGN KEY ("mainServiceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_salaryGridId_fkey" FOREIGN KEY ("salaryGridId") REFERENCES "SalaryGrid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeePolyvalence" ADD CONSTRAINT "EmployeePolyvalence_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeePolyvalence" ADD CONSTRAINT "EmployeePolyvalence_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSchedule" ADD CONSTRAINT "EmployeeSchedule_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
