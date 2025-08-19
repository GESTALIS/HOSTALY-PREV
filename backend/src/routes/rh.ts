const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');
const { requireAuth } = require('./auth');

const prisma = new PrismaClient();
const rhRouter = Router();

// Route de test sans authentification
rhRouter.get('/test', (req, res) => {
  res.json({ message: 'API RH fonctionne !', timestamp: new Date().toISOString() });
});

// === GESTION EMPLOYÉS ===

// GET /api/v1/rh/employees - Liste des employés avec filtres (DEV: sans auth)
rhRouter.get('/employees', async (req, res, next) => {
  try {
    const { name, service, status, contractType } = req.query;
    
    const where = {};
    if (name) {
      where.OR = [
        { firstName: { contains: name, mode: 'insensitive' } },
        { lastName: { contains: name, mode: 'insensitive' } }
      ];
    }
    if (service) where.mainServiceId = Number(service);
    if (status !== undefined) where.isActive = status === 'true';
    if (contractType) where.contractType = contractType;

    const employees = await prisma.employee.findMany({
      where,
      include: {
        mainService: { select: { id: true, name: true, color: true } },
        salaryGrid: { select: { level: true, echelon: true, hourlyRate: true } },
        polyvalentServices: { include: { service: { select: { id: true, name: true } } } }
      },
      orderBy: { lastName: 'asc' }
    });

    res.json(employees);
  } catch (e) { next(e); }
});

// POST /api/v1/rh/employees - Créer un employé (DEV: sans auth)
rhRouter.post('/employees', async (req, res, next) => {
  try {
    const { firstName, lastName, mainServiceId, contractType, weeklyHours, salaryGridId, polyvalentServiceIds = [] } = req.body;

    const employee = await prisma.employee.create({
      data: {
        firstName,
        lastName,
        mainServiceId: Number(mainServiceId),
        contractType,
        weeklyHours,
        salaryGridId: Number(salaryGridId),
        polyvalentServices: {
          create: polyvalentServiceIds.map(serviceId => ({
            serviceId: Number(serviceId)
          }))
        }
      },
      include: {
        mainService: { select: { id: true, name: true, color: true } },
        salaryGrid: { select: { level: true, echelon: true, hourlyRate: true } },
        polyvalentServices: { include: { service: { select: { id: true, name: true } } } }
      }
    });

    res.status(201).json(employee);
  } catch (e) { next(e); }
});

// PUT /api/v1/rh/employees/:id - Modifier un employé
rhRouter.put('/employees/:id', requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { firstName, lastName, mainServiceId, contractType, weeklyHours, salaryGridId, polyvalentServiceIds = [], isActive } = req.body;

    // Supprimer les anciennes polyvalences
    await prisma.employeePolyvalence.deleteMany({ where: { employeeId: id } });

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        firstName,
        lastName,
        mainServiceId: Number(mainServiceId),
        contractType,
        weeklyHours,
        salaryGridId: Number(salaryGridId),
        isActive,
        polyvalentServices: {
          create: polyvalentServiceIds.map(serviceId => ({
            serviceId: Number(serviceId)
          }))
        }
      },
      include: {
        mainService: { select: { id: true, name: true, color: true } },
        salaryGrid: { select: { level: true, echelon: true, hourlyRate: true } },
        polyvalentServices: { include: { service: { select: { id: true, name: true } } } }
      }
    });

    res.json(employee);
  } catch (e) { next(e); }
});

// DELETE /api/v1/rh/employees/:id - Supprimer un employé
rhRouter.delete('/employees/:id', requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.employee.delete({ where: { id } });
    res.status(204).send();
  } catch (e) { next(e); }
});

// === GESTION SERVICES ===

// GET /api/v1/rh/services - Liste des services (DEV: sans auth)
rhRouter.get('/services', async (req, res, next) => {
  try {
    const services = await prisma.service.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        color: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { name: 'asc' }
    });

    res.json(services);
  } catch (e) { next(e); }
});

// POST /api/v1/rh/services - Créer un service
rhRouter.post('/services', requireAuth, async (req, res, next) => {
  try {
    const { name, type, color, schedules = [] } = req.body;

    const service = await prisma.service.create({
      data: {
        name,
        type,
        color,
        schedules: {
          create: schedules.map(schedule => ({
            season: schedule.season,
            dayOfWeek: schedule.dayOfWeek,
            openTime: schedule.openTime,
            closeTime: schedule.closeTime,
            isHoliday: schedule.isHoliday || false,
            isException: schedule.isException || false
          }))
        }
      },
      include: {
        schedules: { orderBy: [{ season: 'asc' }, { dayOfWeek: 'asc' }] }
      }
    });

    res.status(201).json(service);
  } catch (e) { next(e); }
});

// PUT /api/v1/rh/services/:id/schedule - Modifier les horaires d'un service
rhRouter.put('/services/:id/schedule', requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { schedules } = req.body;

    // Supprimer les anciens horaires
    await prisma.serviceSchedule.deleteMany({ where: { serviceId: id } });

    // Créer les nouveaux horaires
    if (schedules.length > 0) {
      await prisma.serviceSchedule.createMany({
        data: schedules.map(schedule => ({
          serviceId: id,
          season: schedule.season,
          dayOfWeek: schedule.dayOfWeek,
          openTime: schedule.openTime,
          closeTime: schedule.closeTime,
          isHoliday: schedule.isHoliday || false,
          isException: schedule.isException || false
        }))
      });
    }

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        schedules: { orderBy: [{ season: 'asc' }, { dayOfWeek: 'asc' }] }
      }
    });

    res.json(service);
  } catch (e) { next(e); }
});

// === GRILLE SALARIALE ===

// GET /api/v1/rh/salary-grid - Liste de la grille salariale (DEV: sans auth)
rhRouter.get('/salary-grid', async (req, res, next) => {
  try {
    const salaryGrid = await prisma.salaryGrid.findMany({
      orderBy: [{ level: 'asc' }, { echelon: 'asc' }]
    });

    res.json(salaryGrid);
  } catch (e) { next(e); }
});

// POST /api/v1/rh/salary-grid - Créer une entrée de grille (DEV: sans auth)
rhRouter.post('/salary-grid', async (req, res, next) => {
  try {
    const { level, echelon, hourlyRate, daysOff, vacationDays } = req.body;

    const salaryEntry = await prisma.salaryGrid.create({
      data: {
        level: Number(level),
        echelon: Number(echelon),
        hourlyRate,
        daysOff: Number(daysOff),
        vacationDays: Number(vacationDays)
      }
    });

    res.status(201).json(salaryEntry);
  } catch (e) { next(e); }
});

// PUT /api/v1/rh/salary-grid/:id - Modifier une grille salariale (DEV: sans auth)
rhRouter.put('/salary-grid/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { level, echelon, hourlyRate, daysOff, vacationDays } = req.body;

    const salaryEntry = await prisma.salaryGrid.update({
      where: { id },
      data: {
        level: Number(level),
        echelon: Number(echelon),
        hourlyRate,
        daysOff: Number(daysOff),
        vacationDays: Number(vacationDays)
      }
    });

    res.json(salaryEntry);
  } catch (e) { next(e); }
});

// DELETE /api/v1/rh/salary-grid/:id - Supprimer une grille salariale (DEV: sans auth)
rhRouter.delete('/salary-grid/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.salaryGrid.delete({ where: { id } });
    res.status(204).send();
  } catch (e) { next(e); }
});

module.exports = { rhRouter };
