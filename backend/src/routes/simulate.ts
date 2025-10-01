import { Router, Request, Response } from 'express';
import { requireAuth } from './auth.js';

const simulateRouter = Router();

simulateRouter.post('/:id', requireAuth, (req: Request, res: Response) => {
  res.status(501).json({ code: 'NOT_IMPLEMENTED', message: 'Simulation non implémentée en Phase 0' });
});

export { simulateRouter };


