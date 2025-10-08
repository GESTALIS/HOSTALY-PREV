const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');
const { requireAuth } = require('./auth');

const router = Router();
const prisma = new PrismaClient();

// === PLANNING INTELLIGENT ===

// GET /api/v1/planning/recommendations - Obtenir les recommandations de planning
router.get('/recommendations', requireAuth, async (req, res, next) => {
  try {
    const currentDate = new Date();
    const currentSeason = getCurrentSeason(currentDate);
    
    // Récupérer tous les services avec leurs horaires et employés
    const services = await prisma.service.findMany({
      where: { isActive: true },
      include: {
        employees: {
          where: { isActive: true },
          include: {
            polyvalentServices: {
              include: { service: true }
            },
            salaryGrid: true
          }
        },
        schedules: {
          where: { season: currentSeason }
        },
        staffingRules: true
      }
    });

    // Récupérer la configuration RH pour les contraintes
    const config = await getRHConfig();
    
    // Générer les recommandations
    const recommendations = await generatePlanningRecommendations(services, config, currentSeason);
    
    res.json({
      currentSeason,
      currentDate,
      recommendations,
      summary: {
        totalServices: services.length,
        totalEmployees: services.reduce((sum, s) => sum + s.employees.length, 0),
        totalRecommendations: recommendations.length,
        potentialSavings: recommendations.reduce((sum, r) => sum + (r.potentialSavings || 0), 0)
      }
    });
  } catch (e) { next(e); }
});

// GET /api/v1/planning/analysis/:serviceId - Analyse détaillée d'un service
router.get('/analysis/:serviceId', requireAuth, async (req, res, next) => {
  try {
    const serviceId = parseInt(req.params.serviceId);
    const currentDate = new Date();
    const currentSeason = getCurrentSeason(currentDate);
    
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        employees: {
          where: { isActive: true },
          include: {
            polyvalentServices: {
              include: { service: true }
            },
            salaryGrid: true,
            schedules: {
              where: {
                date: {
                  gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
                  lt: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
                }
              }
            }
          }
        },
        schedules: {
          where: { season: currentSeason }
        },
        staffingRules: true
      }
    });

    if (!service) {
      return res.status(404).json({ error: 'Service non trouvé' });
    }

    const analysis = await analyzeServicePlanning(service, currentSeason);
    
    res.json(analysis);
  } catch (e) { next(e); }
});

// POST /api/v1/planning/simulate - Simuler un changement de planning
router.post('/simulate', requireAuth, async (req, res, next) => {
  try {
    const { serviceId, changes } = req.body;
    
    const simulation = await simulatePlanningChange(serviceId, changes);
    
    res.json(simulation);
  } catch (e) { next(e); }
});

// === FONCTIONS UTILITAIRES ===

function getCurrentSeason(date) {
  const currentYear = date.getFullYear();
  
  const highSeasonPeriods = [
    { start: new Date(`${currentYear}-10-18`), end: new Date(`${currentYear}-11-03`) },
    { start: new Date(`${currentYear}-12-20`), end: new Date(`${currentYear + 1}-01-05`) },
    { start: new Date(`${currentYear + 1}-02-07`), end: new Date(`${currentYear + 1}-02-23`) },
    { start: new Date(`${currentYear + 1}-04-01`), end: new Date(`${currentYear + 1}-04-16`) },
    { start: new Date(`${currentYear + 1}-07-04`), end: new Date(`${currentYear + 1}-08-31`) }
  ];

  for (const period of highSeasonPeriods) {
    if (date >= period.start && date <= period.end) {
      return 'HAUTE';
    }
  }

  return 'BASSE';
}

async function getRHConfig() {
  // Configuration par défaut (en attendant l'API config)
  return {
    generalRules: {
      minDaysOffPerWeek: 2,
      mandatoryBreakPerDay: 60,
      maxConsecutiveWorkingDays: 6,
      minRestBetweenShifts: 11,
      minShiftDuration: 4,
      maxShiftDuration: 10
    },
    timeRules: {
      minWeeklyHours: 20,
      maxWeeklyHours: 48,
      overtimeThreshold: 35,
      overtimeRate: 1.25
    }
  };
}

async function generatePlanningRecommendations(services, config, season) {
  const recommendations = [];
  
  for (const service of services) {
    // 1. Analyse des heures d'ouverture vs besoins
    const openingAnalysis = analyzeOpeningHours(service, season);
    if (openingAnalysis.recommendations.length > 0) {
      recommendations.push(...openingAnalysis.recommendations);
    }
    
    // 2. Analyse de la polyvalence
    const polyvalenceAnalysis = analyzePolyvalence(service);
    if (polyvalenceAnalysis.recommendations.length > 0) {
      recommendations.push(...polyvalenceAnalysis.recommendations);
    }
    
    // 3. Analyse des heures travaillées
    const hoursAnalysis = analyzeWorkingHours(service, config);
    if (hoursAnalysis.recommendations.length > 0) {
      recommendations.push(...hoursAnalysis.recommendations);
    }
    
    // 4. Analyse saisonnière
    const seasonalAnalysis = analyzeSeasonalNeeds(service, season);
    if (seasonalAnalysis.recommendations.length > 0) {
      recommendations.push(...seasonalAnalysis.recommendations);
    }
  }
  
  // Trier par impact (économies potentielles)
  return recommendations.sort((a, b) => (b.potentialSavings || 0) - (a.potentialSavings || 0));
}

function analyzeOpeningHours(service, season) {
  const recommendations = [];
  
  if (!service.schedules || service.schedules.length === 0) {
    return { recommendations };
  }
  
  const serviceSchedule = service.schedules[0]; // Prendre le premier horaire
  const openTime = parseTime(serviceSchedule.openTime);
  const closeTime = parseTime(serviceSchedule.closeTime);
  const openingDuration = closeTime - openTime;
  
  // Recommandation : Fermer plus tôt si basse saison et peu d'employés
  if (season === 'BASSE' && service.employees.length > 2) {
    const earlyCloseTime = openTime + Math.max(8, openingDuration - 2); // Minimum 8h d'ouverture
    const potentialSavings = calculateSavingsForHourReduction(service, 2);
    
    recommendations.push({
      type: 'ECONOMY',
      priority: 'HIGH',
      title: `Fermer plus tôt pendant la basse saison`,
      description: `Service ${service.name}: fermer à ${formatTime(earlyCloseTime)} au lieu de ${serviceSchedule.closeTime} pendant la basse saison`,
      serviceId: service.id,
      serviceName: service.name,
      potentialSavings,
      impact: 'Réduction de 2h d\'ouverture = économie d\'1 poste',
      feasibility: 'HIGH',
      constraints: ['Respecter les 8h minimum d\'ouverture'],
      implementation: 'Modifier les horaires dans ServiceSchedule'
    });
  }
  
  return { recommendations };
}

function analyzePolyvalence(service) {
  const recommendations = [];
  
  // Analyser les employés polyvalents
  const polyvalentEmployees = service.employees.filter(emp => 
    emp.polyvalentServices.length > 1
  );
  
  if (polyvalentEmployees.length > 0) {
    recommendations.push({
      type: 'OPTIMIZATION',
      priority: 'MEDIUM',
      title: `Optimiser la polyvalence`,
      description: `${polyvalentEmployees.length} employés polyvalents dans ${service.name} - possibilité de flexibilité`,
      serviceId: service.id,
      serviceName: service.name,
      impact: 'Employés polyvalents peuvent couvrir plusieurs services',
      feasibility: 'HIGH',
      constraints: ['Vérifier les compétences requises'],
      implementation: 'Utiliser les employés polyvalents pour optimiser les plannings'
    });
  }
  
  return { recommendations };
}

function analyzeWorkingHours(service, config) {
  const recommendations = [];
  
  // Analyser les employés qui n'atteignent pas leurs heures
  const underemployed = service.employees.filter(emp => {
    const weeklyHours = getWeeklyHoursFromEnum(emp.weeklyHours);
    return weeklyHours < config.timeRules.minWeeklyHours;
  });
  
  // Analyser les employés en surcharge
  const overworked = service.employees.filter(emp => {
    const weeklyHours = getWeeklyHoursFromEnum(emp.weeklyHours);
    return weeklyHours > config.timeRules.maxWeeklyHours;
  });
  
  if (underemployed.length > 0) {
    recommendations.push({
      type: 'ALERT',
      priority: 'HIGH',
      title: `Employés sous-employés`,
      description: `${underemployed.length} employés n'atteignent pas le minimum de ${config.timeRules.minWeeklyHours}h/semaine`,
      serviceId: service.id,
      serviceName: service.name,
      employees: underemployed.map(emp => ({
        id: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        currentHours: getWeeklyHoursFromEnum(emp.weeklyHours),
        minHours: config.timeRules.minWeeklyHours
      })),
      impact: 'Risque de démotivation et turnover',
      feasibility: 'MEDIUM',
      constraints: ['Besoin de plus d\'heures disponibles'],
      implementation: 'Augmenter les créneaux ou redistribuer les heures'
    });
  }
  
  if (overworked.length > 0) {
    recommendations.push({
      type: 'ALERT',
      priority: 'HIGH',
      title: `Employés surchargés`,
      description: `${overworked.length} employés dépassent le maximum de ${config.timeRules.maxWeeklyHours}h/semaine`,
      serviceId: service.id,
      serviceName: service.name,
      employees: overworked.map(emp => ({
        id: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        currentHours: getWeeklyHoursFromEnum(emp.weeklyHours),
        maxHours: config.timeRules.maxWeeklyHours
      })),
      impact: 'Risque de burnout et coûts supplémentaires',
      feasibility: 'HIGH',
      constraints: ['Respecter les limites légales'],
      implementation: 'Réduire les heures ou embaucher du personnel'
    });
  }
  
  return { recommendations };
}

function analyzeSeasonalNeeds(service, season) {
  const recommendations = [];
  
  // Logique saisonnière basique
  if (season === 'HAUTE' && service.employees.length < 3) {
    recommendations.push({
      type: 'RECRUITMENT',
      priority: 'MEDIUM',
      title: `Renfort nécessaire pour la haute saison`,
      description: `Service ${service.name} pourrait avoir besoin de personnel supplémentaire`,
      serviceId: service.id,
      serviceName: service.name,
      impact: 'Améliorer la qualité de service pendant la haute saison',
      feasibility: 'MEDIUM',
      constraints: ['Budget disponible', 'Formation du nouveau personnel'],
      implementation: 'Embaucher du personnel saisonnier ou augmenter les heures'
    });
  }
  
  if (season === 'BASSE' && service.employees.length > 4) {
    recommendations.push({
      type: 'ECONOMY',
      priority: 'MEDIUM',
      title: `Optimisation basse saison`,
      description: `Service ${service.name} pourrait réduire son personnel pendant la basse saison`,
      serviceId: service.id,
      serviceName: service.name,
      potentialSavings: calculateSavingsForStaffReduction(service, 1),
      impact: 'Réduction des coûts pendant la basse saison',
      feasibility: 'MEDIUM',
      constraints: ['Maintenir la qualité de service'],
      implementation: 'Réduire les heures ou congés sans solde'
    });
  }
  
  return { recommendations };
}

async function analyzeServicePlanning(service, season) {
  const config = await getRHConfig();
  
  return {
    service: {
      id: service.id,
      name: service.name,
      type: service.type
    },
    season,
    employees: {
      total: service.employees.length,
      active: service.employees.filter(e => e.isActive).length,
      polyvalent: service.employees.filter(e => e.polyvalentServices.length > 1).length
    },
    schedules: service.schedules,
    analysis: {
      openingHours: analyzeOpeningHours(service, season),
      polyvalence: analyzePolyvalence(service),
      workingHours: analyzeWorkingHours(service, config),
      seasonal: analyzeSeasonalNeeds(service, season)
    }
  };
}

async function simulatePlanningChange(serviceId, changes) {
  // Simulation basique - à développer selon les besoins
  return {
    serviceId,
    changes,
    impact: 'Simulation en cours de développement',
    potentialSavings: 0,
    risks: [],
    recommendations: []
  };
}

// Fonctions utilitaires
function parseTime(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours + minutes / 60;
}

function formatTime(hours) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function getWeeklyHoursFromEnum(weeklyHours) {
  const mapping = {
    'H35': 35,
    'H39': 39,
    'H35_MODULABLE': 35,
    'H39_MODULABLE': 39
  };
  return mapping[weeklyHours] || 35;
}

function calculateSavingsForHourReduction(service, hoursReduction) {
  // Calcul simplifié - 1 employé économisé pour 2h de réduction
  const employeesAffected = Math.floor(hoursReduction / 2);
  const averageHourlyRate = service.employees.reduce((sum, emp) => 
    sum + (emp.salaryGrid?.hourlyRate || 15), 0) / service.employees.length;
  
  return employeesAffected * averageHourlyRate * hoursReduction * 4.33; // 4.33 semaines/mois
}

function calculateSavingsForStaffReduction(service, staffReduction) {
  const averageHourlyRate = service.employees.reduce((sum, emp) => 
    sum + (emp.salaryGrid?.hourlyRate || 15), 0) / service.employees.length;
  
  return staffReduction * averageHourlyRate * 35 * 4.33; // 35h/semaine * 4.33 semaines/mois
}

module.exports = { router };
