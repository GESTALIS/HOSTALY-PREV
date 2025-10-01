import { Router, Request, Response } from 'express';
import { requireAuth } from './auth';

const resultsRouter = Router();

// Phase 0: renvoyer structure vide ou 501 documenté
resultsRouter.get('/:id', requireAuth, (req: Request, res: Response) => {
  const granularity = (req.query.granularity) || 'monthly';
  // structure vide
  return res.json({ granularity, items: [], total: 0, page: 1, pageSize: 50 });
});

export { resultsRouter };


