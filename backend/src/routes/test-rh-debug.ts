const { Router } = require('express');

const testRouter = Router();

// Test simple Prisma sans colonnes spécifiques
testRouter.get('/simple-test', async (req: any, res: any) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    // Test basique qui fonctionne dans notre diagnostic
    const count = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Employee"`;
    
    await prisma.$disconnect();

    res.json({
      success: true,
      message: "Test Prisma simple OK",
      count: count
    });

  } catch (error: any) {
    console.error('[TEST-RH] Simple test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      errorCode: error.code
    });
  }
});

// Test avec models Prisma basique
testRouter.get('/model-test', async (req: any, res: any) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    // Test avec model Prisma MAIS sans toutes les colonnes
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        isActive: true
        // Ne sélectionner QUE les colonnes de base
      }
    });
    
    await prisma.$disconnect();

    res.json({
      success: true,
      message: "Test model Prisma OK",
      employees: employees
    });

  } catch (error: any) {
    console.error('[TEST-RH] Model test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      errorCode: error.code,
      stack: error.stack
    });
  }
});

module.exports = { testRouter };
export {};
