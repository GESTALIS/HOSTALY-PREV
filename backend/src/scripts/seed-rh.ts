import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedRH() {
  console.log('🌱 Seeding RH data...');

  // 1. Créer la grille salariale de base
  const salaryGrids = await Promise.all([
    prisma.salaryGrid.create({
      data: { level: 1, echelon: 1, hourlyRate: 12.50, daysOff: 25, vacationDays: 25 }
    }),
    prisma.salaryGrid.create({
      data: { level: 1, echelon: 2, hourlyRate: 13.20, daysOff: 25, vacationDays: 25 }
    }),
    prisma.salaryGrid.create({
      data: { level: 2, echelon: 1, hourlyRate: 14.00, daysOff: 25, vacationDays: 25 }
    }),
    prisma.salaryGrid.create({
      data: { level: 2, echelon: 2, hourlyRate: 15.00, daysOff: 25, vacationDays: 25 }
    }),
    prisma.salaryGrid.create({
      data: { level: 3, echelon: 1, hourlyRate: 16.50, daysOff: 25, vacationDays: 25 }
    })
  ]);

  console.log(`✅ ${salaryGrids.length} grilles salariales créées`);

  // 2. Créer les services de base
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: 'Réception',
        type: 'AUTRE',
        color: '#004b5d',
        schedules: {
          create: [
            // Haute saison - tous les jours
            { season: 'HAUTE' as any, dayOfWeek: 0, openTime: '07:00', closeTime: '23:00' },
            { season: Season.HAUTE, dayOfWeek: 1, openTime: '07:00', closeTime: '23:00' },
            { season: Season.HAUTE, dayOfWeek: 2, openTime: '07:00', closeTime: '23:00' },
            { season: Season.HAUTE, dayOfWeek: 3, openTime: '07:00', closeTime: '23:00' },
            { season: Season.HAUTE, dayOfWeek: 4, openTime: '07:00', closeTime: '23:00' },
            { season: Season.HAUTE, dayOfWeek: 5, openTime: '07:00', closeTime: '23:00' },
            { season: Season.HAUTE, dayOfWeek: 6, openTime: '07:00', closeTime: '23:00' },
            // Basse saison - tous les jours
            { season: 'BASSE' as any, dayOfWeek: 0, openTime: '07:00', closeTime: '22:00' },
            { season: Season.BASSE, dayOfWeek: 1, openTime: '07:00', closeTime: '22:00' },
            { season: Season.BASSE, dayOfWeek: 2, openTime: '07:00', closeTime: '22:00' },
            { season: Season.BASSE, dayOfWeek: 3, openTime: '07:00', closeTime: '22:00' },
            { season: Season.BASSE, dayOfWeek: 4, openTime: '07:00', closeTime: '22:00' },
            { season: Season.BASSE, dayOfWeek: 5, openTime: '07:00', closeTime: '22:00' },
            { season: Season.BASSE, dayOfWeek: 6, openTime: '07:00', closeTime: '22:00' }
          ]
        }
      }
    }),
    prisma.service.create({
      data: {
        name: 'Restaurant',
        type: 'RESTAURATION',
        color: '#eca08e',
        schedules: {
          create: [
            // Haute saison - tous les jours
            { season: Season.HAUTE, dayOfWeek: 0, openTime: '07:00', closeTime: '22:30' },
            { season: Season.HAUTE, dayOfWeek: 1, openTime: '07:00', closeTime: '22:30' },
            { season: Season.HAUTE, dayOfWeek: 2, openTime: '07:00', closeTime: '22:30' },
            { season: Season.HAUTE, dayOfWeek: 3, openTime: '07:00', closeTime: '22:30' },
            { season: Season.HAUTE, dayOfWeek: 4, openTime: '07:00', closeTime: '22:30' },
            { season: Season.HAUTE, dayOfWeek: 5, openTime: '07:00', closeTime: '22:30' },
            { season: Season.HAUTE, dayOfWeek: 6, openTime: '07:00', closeTime: '22:30' },
            // Basse saison - fermé lundi
            { season: 'BASSE' as any, dayOfWeek: 0, openTime: '07:00', closeTime: '22:00' },
            { season: Season.BASSE, dayOfWeek: 1, openTime: '07:00', closeTime: '22:00' },
            { season: Season.BASSE, dayOfWeek: 2, openTime: '07:00', closeTime: '22:00' },
            { season: Season.BASSE, dayOfWeek: 3, openTime: '07:00', closeTime: '22:00' },
            { season: Season.BASSE, dayOfWeek: 4, openTime: '07:00', closeTime: '22:00' },
            { season: Season.BASSE, dayOfWeek: 5, openTime: '07:00', closeTime: '22:00' },
            { season: Season.BASSE, dayOfWeek: 6, openTime: '07:00', closeTime: '22:00' }
          ]
        }
      }
    }),
    prisma.service.create({
      data: {
        name: 'Piscine',
        type: 'AUTRE',
        color: '#ba8a36',
        schedules: {
          create: [
            // Haute saison - tous les jours
            { season: Season.HAUTE, dayOfWeek: 0, openTime: '08:00', closeTime: '20:00' },
            { season: Season.HAUTE, dayOfWeek: 1, openTime: '08:00', closeTime: '20:00' },
            { season: Season.HAUTE, dayOfWeek: 2, openTime: '08:00', closeTime: '20:00' },
            { season: Season.HAUTE, dayOfWeek: 3, openTime: '08:00', closeTime: '20:00' },
            { season: Season.HAUTE, dayOfWeek: 4, openTime: '08:00', closeTime: '20:00' },
            { season: Season.HAUTE, dayOfWeek: 5, openTime: '08:00', closeTime: '20:00' },
            { season: Season.HAUTE, dayOfWeek: 6, openTime: '08:00', closeTime: '20:00' },
            // Basse saison - fermé lundi + horaires réduits
            { season: Season.BASSE, dayOfWeek: 0, openTime: '09:00', closeTime: '18:00' },
            { season: Season.BASSE, dayOfWeek: 1, openTime: '09:00', closeTime: '18:00' },
            { season: Season.BASSE, dayOfWeek: 2, openTime: '09:00', closeTime: '18:00' },
            { season: Season.BASSE, dayOfWeek: 3, openTime: '09:00', closeTime: '18:00' },
            { season: Season.BASSE, dayOfWeek: 4, openTime: '09:00', closeTime: '18:00' },
            { season: Season.BASSE, dayOfWeek: 5, openTime: '09:00', closeTime: '18:00' },
            { season: Season.BASSE, dayOfWeek: 6, openTime: '09:00', closeTime: '18:00' }
          ]
        }
      }
    }),
    prisma.service.create({
      data: {
        name: 'Housekeeping',
        type: 'AUTRE',
        color: '#f89032',
        schedules: {
          create: [
            // Haute saison - tous les jours
            { season: Season.HAUTE, dayOfWeek: 0, openTime: '08:00', closeTime: '18:00' },
            { season: Season.HAUTE, dayOfWeek: 1, openTime: '08:00', closeTime: '18:00' },
            { season: Season.HAUTE, dayOfWeek: 2, openTime: '08:00', closeTime: '18:00' },
            { season: Season.HAUTE, dayOfWeek: 3, openTime: '08:00', closeTime: '18:00' },
            { season: Season.HAUTE, dayOfWeek: 4, openTime: '08:00', closeTime: '18:00' },
            { season: Season.HAUTE, dayOfWeek: 5, openTime: '08:00', closeTime: '18:00' },
            { season: Season.HAUTE, dayOfWeek: 6, openTime: '08:00', closeTime: '18:00' },
            // Basse saison - fermé dimanche
            { season: Season.BASSE, dayOfWeek: 0, openTime: '08:00', closeTime: '17:00' },
            { season: Season.BASSE, dayOfWeek: 1, openTime: '08:00', closeTime: '17:00' },
            { season: Season.BASSE, dayOfWeek: 2, openTime: '08:00', closeTime: '17:00' },
            { season: Season.BASSE, dayOfWeek: 3, openTime: '08:00', closeTime: '17:00' },
            { season: Season.BASSE, dayOfWeek: 4, openTime: '08:00', closeTime: '17:00' },
            { season: Season.BASSE, dayOfWeek: 5, openTime: '08:00', closeTime: '17:00' },
            { season: Season.BASSE, dayOfWeek: 6, openTime: '08:00', closeTime: '17:00' }
          ]
        }
      }
    })
  ]);

  console.log(`✅ ${services.length} services créés`);

  // 3. Créer quelques employés de test
  const employees = await Promise.all([
    prisma.employee.create({
      data: {
        firstName: 'Marie',
        lastName: 'Dubois',
        mainServiceId: services[0].id, // Réception
        contractType: 'CDI',
        weeklyHours: 'H39',
        salaryGridId: salaryGrids[2].id, // Level 2, Echelon 1
        polyvalentServices: {
          create: [
            { serviceId: services[1].id } // Polyvalente Restaurant
          ]
        }
      }
    }),
    prisma.employee.create({
      data: {
        firstName: 'Jean',
        lastName: 'Martin',
        mainServiceId: services[1].id, // Restaurant
        contractType: 'CDI',
        weeklyHours: 'H35',
        salaryGridId: salaryGrids[1].id, // Level 1, Echelon 2
        polyvalentServices: {
          create: [
            { serviceId: services[3].id } // Polyvalent Housekeeping
          ]
        }
      }
    }),
    prisma.employee.create({
      data: {
        firstName: 'Sophie',
        lastName: 'Bernard',
        mainServiceId: services[2].id, // Piscine
        contractType: 'SAISONNIER',
        weeklyHours: 'H39',
        salaryGridId: salaryGrids[0].id, // Level 1, Echelon 1
        polyvalentServices: {
          create: [
            { serviceId: services[3].id } // Polyvalente Housekeeping
          ]
        }
      }
    })
  ]);

  console.log(`✅ ${employees.length} employés créés`);

  console.log('🎉 Seed RH terminé avec succès !');
}

seedRH()
  .catch((e) => {
    console.error('❌ Erreur lors du seed RH:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
