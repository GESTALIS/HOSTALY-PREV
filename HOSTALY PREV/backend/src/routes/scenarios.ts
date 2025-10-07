const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');
const { requireAuth } = require('./auth');

const prisma = new PrismaClient();
const scenariosRouter = Router();

scenariosRouter.get('/', requireAuth, async (_req, res, next) => {
  try {
    const scenarios = await prisma.scenario.findMany();
    res.json(scenarios);
  } catch (e) { next(e); }
});

scenariosRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const { name, horizonYears = 5, isActive = false } = req.body || {};
    const scenario = await prisma.scenario.create({ data: { name, horizonYears, isActive } });
    res.status(201).json(scenario);
  } catch (e) { next(e); }
});

scenariosRouter.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.scenario.delete({ where: { id } });
    res.status(204).send();
  } catch (e) { next(e); }
});

scenariosRouter.put('/:id/assumptions', requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { revenues = [], charges = [], payroll = [], openings = [] } = req.body || {};

    // Stockage simple: supprimer et réinsérer (Phase 0, sans calculs)
    await prisma.$transaction([
      prisma.revenueAssumption.deleteMany({ where: { scenarioId: id } }),
      prisma.chargeAssumption.deleteMany({ where: { scenarioId: id } }),
    ]);

    if (revenues.length) {
      await prisma.revenueAssumption.createMany({ data: revenues.map((r) => ({ ...r, scenarioId: id })) });
    }
    if (charges.length) {
      await prisma.chargeAssumption.createMany({ data: charges.map((c) => ({ ...c, scenarioId: id })) });
    }

    // payroll & openings stockés dans leurs tables dédiées si fourni (non strictement lié à scenario)
    if (payroll.length) {
      await prisma.payrollAssumption.createMany({ data: payroll });
    }
    if (openings.length) {
      await prisma.openingWindow.createMany({ data: openings });
    }

    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = { scenariosRouter };


