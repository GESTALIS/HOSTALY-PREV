import { PrismaClient, Season } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCalendar(zone: 'A', years: number) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setFullYear(start.getFullYear() + years);
  const data: { date: Date; season: Season; zoneAIsHoliday: boolean }[] = [];
  const d = new Date(start);
  while (d < end) {
    const month = d.getMonth();
    const season: Season = [5, 6, 7].includes(month) ? 'HAUTE' : 'BASSE';
    const dow = d.getDay();
    const zoneAIsHoliday = dow === 0 || dow === 6; // weekends only placeholder
    data.push({ date: new Date(d), season, zoneAIsHoliday });
    d.setDate(d.getDate() + 1);
  }
  // upsert-like: clear then insert
  await prisma.calendarDate.deleteMany({});
  // chunk inserts
  const chunk = 1000;
  for (let i = 0; i < data.length; i += chunk) {
    // eslint-disable-next-line no-await-in-loop
    await prisma.calendarDate.createMany({ data: data.slice(i, i + chunk), skipDuplicates: true });
  }
}

async function main() {
  // Hotel
  await prisma.hotel.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: 'Hôtel Démo', rooms: 44 },
  });
  // Scenario minimal
  await prisma.scenario.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: 'Préproduction v0', horizonYears: 5, isActive: true },
  });
  // Calendar 5 ans Zone A
  await seedCalendar('A', 5);
}

main().then(() => {
  // eslint-disable-next-line no-console
  console.log('Seed Phase 0 terminé');
}).catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});


