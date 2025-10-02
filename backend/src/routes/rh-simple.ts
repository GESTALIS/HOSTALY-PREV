const { Router } = require('express');

const rhSimpleRouter = Router();

// Version simplifiée sans relations
rhSimpleRouter.get('/employees-basic', async (req: any, res: any) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    // Sans relations pour éviter les références cassées
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        contractType: true,
        weeklyHours: true,
        isActive: true,
        mainServiceId: true,
        salaryGridId: true,
        createdAt: true,
        updatedAt: true
        // Colonnes sûres seulement après régénération du client
      }
    });

    await prisma.$disconnect();

    res.json({
      success: true,
      data: employees,
      message: "Liste des employés sans relations"
    });

  } catch (error: any) {
    console.error('[RH-SIMPLE] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      errorCode: error.code
    });
  }
});

module.exports = rhSimpleRouter;
export {};
