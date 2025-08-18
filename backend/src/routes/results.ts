const { Router } = require('express');
const { requireAuth } = require('./auth');

const resultsRouter = Router();

// Phase 0: renvoyer structure vide ou 501 documenté
resultsRouter.get('/:id', requireAuth, (req, res) => {
  const granularity = (req.query.granularity) || 'monthly';
  // structure vide
  return res.json({ granularity, items: [], total: 0, page: 1, pageSize: 50 });
});

module.exports = { resultsRouter };


