-- CreateEnum
CREATE TYPE "Season" AS ENUM ('HAUTE', 'BASSE');

-- CreateEnum
CREATE TYPE "Department" AS ENUM ('HEBERGEMENT', 'FNB', 'SPA', 'MICE', 'AUTRES');

-- CreateEnum
CREATE TYPE "ChargeCategory" AS ENUM ('FIXE', 'VARIABLE', 'SAISONNIERE', 'CAPEX');

-- CreateEnum
CREATE TYPE "Basis" AS ENUM ('PAR_CHAMBRE', 'PAR_NUIT_OCCUPEE', 'POURCENT_CA', 'MONTANT');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('RESTAURATION', 'AUTRE');

-- CreateTable
CREATE TABLE "Hotel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "rooms" INTEGER NOT NULL,

    CONSTRAINT "Hotel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarDate" (
    "date" TIMESTAMP(3) NOT NULL,
    "season" "Season" NOT NULL,
    "zoneAIsHoliday" BOOLEAN NOT NULL,

    CONSTRAINT "CalendarDate_pkey" PRIMARY KEY ("date")
);

-- CreateTable
CREATE TABLE "Scenario" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "horizonYears" INTEGER NOT NULL DEFAULT 5,
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Scenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevenueAssumption" (
    "id" SERIAL NOT NULL,
    "scenarioId" INTEGER NOT NULL,
    "department" "Department" NOT NULL,
    "season" "Season" NOT NULL,
    "adr" DECIMAL(10,2),
    "occupancy" DECIMAL(5,2),
    "spendPerOccRoom" DECIMAL(10,2),

    CONSTRAINT "RevenueAssumption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChargeAssumption" (
    "id" SERIAL NOT NULL,
    "scenarioId" INTEGER NOT NULL,
    "category" "ChargeCategory" NOT NULL,
    "department" "Department" NOT NULL,
    "basis" "Basis" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "season" "Season" NOT NULL,
    "capexYears" INTEGER,

    CONSTRAINT "ChargeAssumption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ServiceType" NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpeningWindow" (
    "id" SERIAL NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "season" "Season" NOT NULL,
    "dow" INTEGER NOT NULL,
    "openTime" TEXT NOT NULL,
    "closeTime" TEXT NOT NULL,

    CONSTRAINT "OpeningWindow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffingRule" (
    "id" SERIAL NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "coveragePosts" INTEGER NOT NULL,

    CONSTRAINT "StaffingRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollAssumption" (
    "id" SERIAL NOT NULL,
    "role" TEXT NOT NULL,
    "baseMonthlyGross" DECIMAL(12,2) NOT NULL,
    "employerRate" DECIMAL(5,2) NOT NULL,
    "weeklyNormHours" INTEGER NOT NULL,

    CONSTRAINT "PayrollAssumption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScenarioResultMonthly" (
    "id" SERIAL NOT NULL,
    "scenarioId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "roomsAvailable" INTEGER,
    "roomsSold" INTEGER,
    "adr" DECIMAL(10,2),
    "revpar" DECIMAL(10,2),
    "trevpar" DECIMAL(10,2),
    "caHebergement" DECIMAL(12,2),
    "caFnb" DECIMAL(12,2),
    "caSpa" DECIMAL(12,2),
    "caMice" DECIMAL(12,2),
    "caAutres" DECIMAL(12,2),
    "caTotal" DECIMAL(12,2),
    "payrollTotal" DECIMAL(12,2),
    "opexTotal" DECIMAL(12,2),
    "capexAmort" DECIMAL(12,2),
    "gop" DECIMAL(12,2),
    "ebitda" DECIMAL(12,2),
    "resultatNet" DECIMAL(12,2),

    CONSTRAINT "ScenarioResultMonthly_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RevenueAssumption" ADD CONSTRAINT "RevenueAssumption_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChargeAssumption" ADD CONSTRAINT "ChargeAssumption_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningWindow" ADD CONSTRAINT "OpeningWindow_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffingRule" ADD CONSTRAINT "StaffingRule_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
