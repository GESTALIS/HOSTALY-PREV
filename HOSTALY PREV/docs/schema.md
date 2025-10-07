# Schéma fonctionnel — v0

Tables principales:
- `Hotel(id, name, rooms)`
- `CalendarDate(date, season:HAUTE|BASSE, zoneAIsHoliday:boolean)`
- `Scenario(id, name, horizonYears=5, isActive)`
- `RevenueAssumption(scenarioId, department:HEBERGEMENT|FNB|SPA|MICE|AUTRES, season, adr?, occupancy?, spendPerOccRoom?)`
- `ChargeAssumption(scenarioId, category:FIXE|VARIABLE|SAISONNIERE|CAPEX, department, basis:PAR_CHAMBRE|PAR_NUIT_OCCUPEE|%_CA|MONTANT, amount, season, capexYears?)`
- `Service(id, name, type:RESTAURATION|AUTRE)`
- `OpeningWindow(serviceId, season, dow(0–6), openTime, closeTime)`
- `StaffingRule(serviceId, coveragePosts:int)`
- `PayrollAssumption(role, baseMonthlyGross, employerRate, weeklyNormHours)`
- `ScenarioResultMonthly(...)` (structure seule en Phase 0)

Relations principales identiques à Prisma `schema.prisma`.
