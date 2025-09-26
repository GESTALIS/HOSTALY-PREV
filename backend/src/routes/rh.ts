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
      where: { isActive: true }
    });
    res.json(services);
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