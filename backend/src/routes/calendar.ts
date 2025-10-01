import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from './auth';

const prisma = new PrismaClient();
const calendarRouter = Router();

calendarRouter.get('/zone-a', requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await prisma.calendarDate.findMany({ orderBy: { date: 'asc' } });
    res.json(rows);
  } catch (e) { next(e); }
});

export { calendarRouter };


