const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');
const { requireAuth } = require('./auth');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:postgres@localhost:5434/hotaly_prev"
    }
  }
});
const rhRouter = Router();

// Route de test sans authentification
rhRouter.get('/test', (req, res) => {
  res.json({ message: 'API RH fonctionne !', timestamp: new Date().toISOString() });
});

// === GESTION EMPLOYÉS ===

// GET /api/v1/rh/employees - Liste des employés avec filtres
rhRouter.get('/employees', async (req, res, next) => {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        mainService: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        salaryGrid: {
          select: {
            level: true,
            echelon: true,
            hourlyRate: true
          }
        },
        polyvalentServices: {
          include: {
            service: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    res.json(employees);
  } catch (e) { next(e); }
});

// POST /api/v1/rh/employees - Créer un employé
rhRouter.post('/employees', async (req, res, next) => {
  try {
    const { firstName, lastName, mainServiceId, contractType, weeklyHours, salaryLevel, salaryEchelon, hourlyRate, polyvalentServiceIds = [] } = req.body;

    // Créer d'abord la grille salariale
    const salaryGrid = await prisma.salaryGrid.create({
      data: {
        level: Number(salaryLevel),
        echelon: Number(salaryEchelon),
        hourlyRate: Number(hourlyRate),
        daysOff: 0,
        vacationDays: 25
      }
    });

    // Créer l'employé avec polyvalence
    const employee = await prisma.employee.create({
      data: {
        firstName,
        lastName,
        contractType,
        weeklyHours,
        isActive: true,
        mainServiceId: Number(mainServiceId),
        salaryGridId: salaryGrid.id,
        polyvalentServices: {
          create: polyvalentServiceIds.map(serviceId => ({
            serviceId: Number(serviceId)
          }))
        }
      },
      include: {
        mainService: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        salaryGrid: {
          select: {
            level: true,
            echelon: true,
            hourlyRate: true
          }
        },
        polyvalentServices: {
          include: {
            service: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    res.status(201).json(employee);
  } catch (e) { next(e); }
});

// PUT /api/v1/rh/employees/:id - Modifier un employé
rhRouter.put('/employees/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { firstName, lastName, mainServiceId, contractType, weeklyHours, isActive } = req.body;

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: {
        firstName,
        lastName,
        mainServiceId: Number(mainServiceId),
        contractType,
        weeklyHours,
        isActive
      },
      include: {
        mainService: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        salaryGrid: {
          select: {
            level: true,
            echelon: true,
            hourlyRate: true
          }
        },
        polyvalentServices: {
          include: {
            service: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    res.json(updatedEmployee);
  } catch (e) { next(e); }
});

// DELETE /api/v1/rh/employees/:id - Supprimer un employé
rhRouter.delete('/employees/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    
    // Supprimer d'abord les services polyvalents
    await prisma.employeePolyvalence.deleteMany({
      where: { employeeId: id }
    });

    // Supprimer l'employé
    await prisma.employee.delete({
      where: { id }
    });
    
    res.status(204).send();
  } catch (e) { next(e); }
});

// === GESTION SERVICES ===

// GET /api/v1/rh/services - Liste des services
rhRouter.get('/services', async (req, res, next) => {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      include: {
        schedules: {
          orderBy: [
            { season: 'asc' },
            { dayOfWeek: 'asc' }
          ]
        },
        _count: {
          select: {
            employees: true
          }
        }
      }
    });
    res.json(services);
  } catch (e) { next(e); }
});

// POST /api/v1/rh/services - Créer un service
rhRouter.post('/services', async (req, res, next) => {
  try {
    const { name, type, color, isActive = true, schedules = [] } = req.body;

    // Vérifier que le nom est unique
    const existingService = await prisma.service.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    });

    if (existingService) {
      return res.status(400).json({
        code: 'SERVICE_NAME_EXISTS',
        message: 'Un service avec ce nom existe déjà'
      });
    }

    const service = await prisma.service.create({
      data: {
        name,
        type,
        color: color || '#eca08e',
        isActive,
        schedules: {
          create: schedules.map((schedule: any) => ({
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
        schedules: {
          orderBy: [
            { season: 'asc' },
            { dayOfWeek: 'asc' }
          ]
        },
        _count: {
          select: {
            employees: true
          }
        }
      }
    });

    res.status(201).json(service);
  } catch (e) { next(e); }
});

// PUT /api/v1/rh/services/:id - Modifier un service
rhRouter.put('/services/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, type, color, isActive, schedules = [] } = req.body;

    // Vérifier que le service existe
    const existingService = await prisma.service.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingService) {
      return res.status(404).json({
        code: 'SERVICE_NOT_FOUND',
        message: 'Service non trouvé'
      });
    }

    // Vérifier que le nom est unique (sauf pour le service actuel)
    if (name && name !== existingService.name) {
      const duplicateService = await prisma.service.findFirst({
        where: { 
          name: { equals: name, mode: 'insensitive' },
          id: { not: parseInt(id) }
        }
      });

      if (duplicateService) {
        return res.status(400).json({
          code: 'SERVICE_NAME_EXISTS',
          message: 'Un service avec ce nom existe déjà'
        });
      }
    }

    // Supprimer les anciens horaires
    await prisma.serviceSchedule.deleteMany({
      where: { serviceId: parseInt(id) }
    });

    const service = await prisma.service.update({
      where: { id: parseInt(id) },
      data: {
        name,
        type,
        color,
        isActive,
        schedules: {
          create: schedules.map((schedule: any) => ({
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
        schedules: {
          orderBy: [
            { season: 'asc' },
            { dayOfWeek: 'asc' }
          ]
        },
        _count: {
          select: {
            employees: true
          }
        }
      }
    });

    res.json(service);
  } catch (e) { next(e); }
});

// DELETE /api/v1/rh/services/:id - Supprimer un service
rhRouter.delete('/services/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Vérifier que le service existe
    const existingService = await prisma.service.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            employees: true
          }
        }
      }
    });

    if (!existingService) {
      return res.status(404).json({
        code: 'SERVICE_NOT_FOUND',
        message: 'Service non trouvé'
      });
    }

    // Vérifier qu'aucun employé n'est assigné à ce service
    if (existingService._count.employees > 0) {
      return res.status(400).json({
        code: 'SERVICE_HAS_EMPLOYEES',
        message: 'Impossible de supprimer un service qui a des employés assignés'
      });
    }

    // Supprimer les horaires associés
    await prisma.serviceSchedule.deleteMany({
      where: { serviceId: parseInt(id) }
    });

    // Supprimer le service
    await prisma.service.delete({
      where: { id: parseInt(id) }
    });

    res.status(204).send();
  } catch (e) { next(e); }
});

// === GESTION SAISONNALITÉ GUYANE ===

// GET /api/v1/rh/seasons - Obtenir les périodes de saisonnalité
rhRouter.get('/seasons', async (req, res, next) => {
  try {
    const currentYear = new Date().getFullYear();
    
    // Périodes de haute saison basées sur les vacances scolaires Guyane
    const highSeasonPeriods = [
      {
        name: "Vacances de la Toussaint",
        startDate: `${currentYear}-10-18`,
        endDate: `${currentYear}-11-03`,
        season: "HAUTE"
      },
      {
        name: "Vacances de Noël",
        startDate: `${currentYear}-12-20`,
        endDate: `${currentYear + 1}-01-05`,
        season: "HAUTE"
      },
      {
        name: "Vacances de Carnaval",
        startDate: `${currentYear + 1}-02-07`,
        endDate: `${currentYear + 1}-02-23`,
        season: "HAUTE"
      },
      {
        name: "Vacances de Pâques",
        startDate: `${currentYear + 1}-04-01`,
        endDate: `${currentYear + 1}-04-16`,
        season: "HAUTE"
      },
      {
        name: "Grandes vacances (été)",
        startDate: `${currentYear + 1}-07-04`,
        endDate: `${currentYear + 1}-08-31`,
        season: "HAUTE"
      }
    ];

    res.json({
      currentSeason: getCurrentSeason(),
      highSeasonPeriods,
      currentYear,
      nextYear: currentYear + 1
    });
  } catch (e) { next(e); }
});

// Fonction utilitaire pour déterminer la saison actuelle
function getCurrentSeason() {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // Périodes de haute saison (vacances scolaires Guyane)
  const highSeasonPeriods = [
    { start: new Date(`${currentYear}-10-18`), end: new Date(`${currentYear}-11-03`) },
    { start: new Date(`${currentYear}-12-20`), end: new Date(`${currentYear + 1}-01-05`) },
    { start: new Date(`${currentYear + 1}-02-07`), end: new Date(`${currentYear + 1}-02-23`) },
    { start: new Date(`${currentYear + 1}-04-01`), end: new Date(`${currentYear + 1}-04-16`) },
    { start: new Date(`${currentYear + 1}-07-04`), end: new Date(`${currentYear + 1}-08-31`) }
  ];

  // Vérifier si nous sommes en haute saison
  for (const period of highSeasonPeriods) {
    if (now >= period.start && now <= period.end) {
      return 'HAUTE';
    }
  }

  return 'BASSE';
}

// GET /api/v1/rh/services/:id/schedules - Obtenir les horaires d'un service
rhRouter.get('/services/:id/schedules', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { season } = req.query;

    const schedules = await prisma.serviceSchedule.findMany({
      where: {
        serviceId: parseInt(id),
        ...(season && { season: season as 'BASSE' | 'HAUTE' })
      },
      orderBy: [
        { season: 'asc' },
        { dayOfWeek: 'asc' }
      ]
    });

    res.json(schedules);
  } catch (e) { next(e); }
});

// === CONFIGURATION RH GÉNÉRALE ===

// GET /api/v1/rh/config - Obtenir la configuration RH
rhRouter.get('/config', async (req, res, next) => {
  try {
    const config = {
      // Règles générales
      generalRules: {
        minDaysOffPerWeek: 2,
        mandatoryBreakPerDay: 60, // minutes
        maxConsecutiveWorkingDays: 6,
        minRestBetweenShifts: 11, // heures
        minShiftDuration: 4, // heures
        maxShiftDuration: 10 // heures
      },
      
      // Règles de temps
      timeRules: {
        minWeeklyHours: 20,
        maxWeeklyHours: 48,
        overtimeThreshold: 35, // heures
        overtimeRate: 1.25 // 25% de majoration
      },
      
      // Règles de congés
      leaveRules: {
        annualLeaveDays: 25,
        sickLeaveDays: 30,
        maternityLeaveDays: 112,
        paternityLeaveDays: 25,
        emergencyLeaveDays: 5
      },
      
      // Configuration Housekeeping
      housekeeping: {
        totalRooms: 44,
        roomTypes: [
          { type: 'Suite', count: 2, cleaningTime: 45 }, // minutes
          { type: 'Double', count: 30, cleaningTime: 25 },
          { type: 'Family', count: 12, cleaningTime: 35 }
        ],
        totalCleaningTime: 1260, // minutes (21 heures)
        staffRequired: 3 // personnes
      },
      
      // Saisonnalité Guyane
      seasonality: {
        currentSeason: getCurrentSeason(),
        highSeasonPeriods: [
          { name: "Vacances de la Toussaint", start: "2024-10-18", end: "2024-11-03" },
          { name: "Vacances de Noël", start: "2024-12-20", end: "2025-01-05" },
          { name: "Vacances de Carnaval", start: "2025-02-07", end: "2025-02-23" },
          { name: "Vacances de Pâques", start: "2025-04-01", end: "2025-04-16" },
          { name: "Grandes vacances", start: "2025-07-04", end: "2025-08-31" }
        ]
      }
    };

    res.json(config);
  } catch (e) { next(e); }
});

// PUT /api/v1/rh/config - Mettre à jour la configuration RH
rhRouter.put('/config', async (req, res, next) => {
  try {
    const { generalRules, timeRules, leaveRules, housekeeping } = req.body;

    // Ici, on pourrait sauvegarder en base de données
    // Pour l'instant, on retourne la configuration mise à jour
    const updatedConfig = {
      generalRules: generalRules || {
        minDaysOffPerWeek: 2,
        mandatoryBreakPerDay: 60,
        maxConsecutiveWorkingDays: 6,
        minRestBetweenShifts: 11,
        minShiftDuration: 4,
        maxShiftDuration: 10
      },
      timeRules: timeRules || {
        minWeeklyHours: 20,
        maxWeeklyHours: 48,
        overtimeThreshold: 35,
        overtimeRate: 1.25
      },
      leaveRules: leaveRules || {
        annualLeaveDays: 25,
        sickLeaveDays: 30,
        maternityLeaveDays: 112,
        paternityLeaveDays: 25,
        emergencyLeaveDays: 5
      },
      housekeeping: housekeeping || {
        totalRooms: 44,
        roomTypes: [
          { type: 'Suite', count: 2, cleaningTime: 45 },
          { type: 'Double', count: 30, cleaningTime: 25 },
          { type: 'Family', count: 12, cleaningTime: 35 }
        ],
        totalCleaningTime: 1260,
        staffRequired: 3
      }
    };

    res.json(updatedConfig);
  } catch (e) { next(e); }
});

// === GESTION GRILLES SALARIALES ===

// GET /api/v1/rh/salary-grid - Liste des grilles salariales
rhRouter.get('/salary-grid', async (req, res, next) => {
  try {
    const salaryGrids = await prisma.salaryGrid.findMany();
    res.json(salaryGrids);
  } catch (e) { next(e); }
});

module.exports = rhRouter;