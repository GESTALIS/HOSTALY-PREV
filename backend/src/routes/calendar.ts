const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');
const { requireAuth } = require('./auth');

const prisma = new PrismaClient();
const calendarRouter = Router();

calendarRouter.get('/zone-a', requireAuth, async (_req, res, next) => {
  try {
    const rows = await prisma.calendarDate.findMany({ orderBy: { date: 'asc' } });
    res.json(rows);
  } catch (e) { next(e); }
});

module.exports = { calendarRouter };


