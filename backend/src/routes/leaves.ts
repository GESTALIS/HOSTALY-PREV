const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');
const { requireAuth } = require('./auth');

const router = Router();
const prisma = new PrismaClient();

// === GESTION DES CONGÉS PAYÉS ===

// GET /api/v1/leaves/employee/:employeeId - Obtenir les congés d'un employé
router.get('/employee/:employeeId', requireAuth, async (req, res, next) => {
  try {
    const employeeId = parseInt(req.params.employeeId);
    const { year } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    
    const leaves = await prisma.paidLeave.findMany({
      where: {
        employeeId,
        year: currentYear
      },
      orderBy: {
        startDate: 'asc'
      }
    });
    
    // Calculer le total de jours pris
    const totalDaysTaken = leaves.reduce((sum, leave) => sum + leave.days, 0);
    const legalDays = 30; // Jours légaux en France
    const remainingDays = legalDays - totalDaysTaken;
    
    // Vérifier la conformité légale
    const isCompliant = totalDaysTaken >= 20 || isBeforeJune(currentYear);
    const needsAlert = remainingDays > 15 && isAfterJune(currentYear);
    
    res.json({
      employeeId,
      year: currentYear,
      leaves,
      summary: {
        totalDaysTaken,
        legalDays,
        remainingDays,
        isCompliant,
        needsAlert,
        complianceMessage: getComplianceMessage(totalDaysTaken, remainingDays, currentYear)
      }
    });
  } catch (e) { next(e); }
});

// GET /api/v1/leaves/all - Obtenir tous les congés (vue globale)
router.get('/all', requireAuth, async (req, res, next) => {
  try {
    const { year } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    
    const employees = await prisma.employee.findMany({
      where: { isActive: true },
      include: {
        paidLeaves: {
          where: { year: currentYear }
        },
        mainService: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });
    
    const summary = employees.map(emp => {
      const totalDaysTaken = emp.paidLeaves.reduce((sum, leave) => sum + leave.days, 0);
      const legalDays = 30;
      const remainingDays = legalDays - totalDaysTaken;
      const isCompliant = totalDaysTaken >= 20 || isBeforeJune(currentYear);
      
      return {
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        service: emp.mainService.name,
        totalDaysTaken,
        legalDays,
        remainingDays,
        isCompliant,
        status: getLeaveStatus(totalDaysTaken, remainingDays, currentYear)
      };
    });
    
    res.json({
      year: currentYear,
      employees: summary,
      globalCompliance: {
        compliant: summary.filter(e => e.isCompliant).length,
        nonCompliant: summary.filter(e => !e.isCompliant).length,
        total: summary.length
      }
    });
  } catch (e) { next(e); }
});

// POST /api/v1/leaves - Créer un congé payé
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { employeeId, startDate, endDate, notes } = req.body;
    
    // Calculer le nombre de jours
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = calculateWorkingDays(start, end);
    const year = start.getFullYear();
    
    // Vérifier que l'employé ne dépasse pas 30 jours
    const existingLeaves = await prisma.paidLeave.findMany({
      where: {
        employeeId: parseInt(employeeId),
        year
      }
    });
    
    const totalDays = existingLeaves.reduce((sum, leave) => sum + leave.days, 0) + days;
    
    if (totalDays > 30) {
      return res.status(400).json({
        code: 'LEAVE_LIMIT_EXCEEDED',
        message: `L'employé ne peut pas prendre plus de 30 jours de congés par an (total: ${totalDays} jours)`
      });
    }
    
    // Créer le congé
    const leave = await prisma.paidLeave.create({
      data: {
        employeeId: parseInt(employeeId),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        days,
        year,
        status: 'APPROVED',
        notes
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            mainService: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });
    
    res.status(201).json(leave);
  } catch (e) { next(e); }
});

// PUT /api/v1/leaves/:id - Modifier un congé payé
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { startDate, endDate, status, notes } = req.body;
    
    const existingLeave = await prisma.paidLeave.findUnique({
      where: { id }
    });
    
    if (!existingLeave) {
      return res.status(404).json({
        code: 'LEAVE_NOT_FOUND',
        message: 'Congé non trouvé'
      });
    }
    
    // Recalculer les jours si les dates changent
    let days = existingLeave.days;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      days = calculateWorkingDays(start, end);
    }
    
    const updatedLeave = await prisma.paidLeave.update({
      where: { id },
      data: {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        days,
        status,
        notes
      }
    });
    
    res.json(updatedLeave);
  } catch (e) { next(e); }
});

// DELETE /api/v1/leaves/:id - Supprimer un congé payé
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    
    await prisma.paidLeave.delete({
      where: { id }
    });
    
    res.status(204).send();
  } catch (e) { next(e); }
});

// === FONCTIONS UTILITAIRES ===

function calculateWorkingDays(startDate, endDate) {
  let count = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    // Exclure samedi (6) et dimanche (0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

function isBeforeJune(year) {
  const now = new Date();
  const june = new Date(year, 5, 1); // 1er juin
  return now < june;
}

function isAfterJune(year) {
  const now = new Date();
  const june = new Date(year, 5, 1); // 1er juin
  return now >= june;
}

function getLeaveStatus(daysTaken, remainingDays, year) {
  if (daysTaken >= 30) {
    return { level: 'complete', label: 'Complet', color: 'green' };
  } else if (daysTaken >= 20) {
    return { level: 'good', label: 'Conforme', color: 'green' };
  } else if (remainingDays > 15 && isAfterJune(year)) {
    return { level: 'warning', label: 'Attention', color: 'yellow' };
  } else if (remainingDays > 20 && isAfterJune(year)) {
    return { level: 'danger', label: 'Risque légal', color: 'red' };
  } else {
    return { level: 'normal', label: 'En cours', color: 'blue' };
  }
}

function getComplianceMessage(daysTaken, remainingDays, year) {
  if (daysTaken >= 30) {
    return 'Tous les congés payés ont été pris';
  } else if (daysTaken >= 20) {
    return `Conforme - ${remainingDays} jours restants`;
  } else if (remainingDays > 15 && isAfterJune(year)) {
    return `⚠️ Attention - Il reste ${remainingDays} jours à prendre avant fin d'année`;
  } else if (remainingDays > 20 && isAfterJune(year)) {
    return `❌ RISQUE LÉGAL - ${remainingDays} jours non pris (obligation de prendre au moins 20j/an)`;
  } else {
    return `${daysTaken} jours pris sur 30 - ${remainingDays} jours restants`;
  }
}

module.exports = { router };
