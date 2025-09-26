const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  // Créer les services hôteliers
  const services = await Promise.all([
    prisma.service.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, name: "PDJ", type: "RESTAURATION", color: "#F59E0B", isActive: true }
    }),
    prisma.service.upsert({
      where: { id: 2 },
      update: {},
      create: { id: 2, name: "Réception", type: "AUTRE", color: "#3B82F6", isActive: true }
    }),
    prisma.service.upsert({
      where: { id: 3 },
      update: {},
      create: { id: 3, name: "Housekeeping", type: "AUTRE", color: "#10B981", isActive: true }
    }),
    prisma.service.upsert({
      where: { id: 4 },
      update: {},
      create: { id: 4, name: "Bar Snack", type: "RESTAURATION", color: "#8B5CF6", isActive: true }
    }),
    prisma.service.upsert({
      where: { id: 5 },
      update: {},
      create: { id: 5, name: "Loisir", type: "AUTRE", color: "#06B6D4", isActive: true }
    }),
    prisma.service.upsert({
      where: { id: 6 },
      update: {},
      create: { id: 6, name: "Bar Hôtel", type: "RESTAURATION", color: "#EF4444", isActive: true }
    }),
    prisma.service.upsert({
      where: { id: 7 },
      update: {},
      create: { id: 7, name: "Technique", type: "AUTRE", color: "#6B7280", isActive: true }
    }),
    prisma.service.upsert({
      where: { id: 8 },
      update: {},
      create: { id: 8, name: "Loisir Outdoor (Piscine)", type: "AUTRE", color: "#0891B2", isActive: true }
    }),
    prisma.service.upsert({
      where: { id: 9 },
      update: {},
      create: { id: 9, name: "Loisir Indoor", type: "AUTRE", color: "#7C3AED", isActive: true }
    }),
    prisma.service.upsert({
      where: { id: 10 },
      update: {},
      create: { id: 10, name: "Caisse", type: "AUTRE", color: "#059669", isActive: true }
    })
  ]);

  console.log('✅ Services créés:', services.length);

  // Créer quelques grilles salariales
  const salaryGrids = await Promise.all([
    prisma.salaryGrid.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, level: 1, echelon: 1, hourlyRate: 15.50, daysOff: 0, vacationDays: 25 }
    }),
    prisma.salaryGrid.upsert({
      where: { id: 2 },
      update: {},
      create: { id: 2, level: 1, echelon: 2, hourlyRate: 15.75, daysOff: 0, vacationDays: 25 }
    }),
    prisma.salaryGrid.upsert({
      where: { id: 3 },
      update: {},
      create: { id: 3, level: 2, echelon: 1, hourlyRate: 16.50, daysOff: 0, vacationDays: 30 }
    }),
    prisma.salaryGrid.upsert({
      where: { id: 4 },
      update: {},
      create: { id: 4, level: 3, echelon: 1, hourlyRate: 18.00, daysOff: 0, vacationDays: 30 }
    })
  ]);

  console.log('✅ Grilles salariales créées:', salaryGrids.length);

  // Créer quelques employés de test
  const employees = await Promise.all([
    prisma.employee.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        firstName: "Sophie",
        lastName: "Bernard",
        contractType: "CDI",
        weeklyHours: "H35",
        isActive: true,
        mainServiceId: 2, // Réception
        salaryGridId: 1,
        polyvalentServices: {
          create: [
            { serviceId: 1 }, // PDJ
            { serviceId: 10 }  // Caisse
          ]
        }
      }
    }),
    prisma.employee.upsert({
      where: { id: 2 },
      update: {},
      create: {
        id: 2,
        firstName: "Marie",
        lastName: "Dubois",
        contractType: "CDI",
        weeklyHours: "H39",
        isActive: true,
        mainServiceId: 3, // Housekeeping
        salaryGridId: 2,
        polyvalentServices: {
          create: [
            { serviceId: 8 } // Loisir Outdoor (Piscine)
          ]
        }
      }
    }),
    prisma.employee.upsert({
      where: { id: 3 },
      update: {},
      create: {
        id: 3,
        firstName: "Jean",
        lastName: "Martin",
        contractType: "CDI",
        weeklyHours: "H35_MODULABLE",
        isActive: true,
        mainServiceId: 4, // Bar Snack
        salaryGridId: 2,
        polyvalentServices: {
          create: [
            { serviceId: 6 }, // Bar Hôtel
            { serviceId: 1 }  // PDJ
          ]
        }
      }
    })
  ]);

  console.log('✅ Employés créés:', employees.length);
  console.log('🎉 Seeding terminé avec succès !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
