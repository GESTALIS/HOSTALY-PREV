const { Router } = require('express');
const { requireAuth } = require('./auth');

const simulateRouter = Router();

simulateRouter.post('/:id', requireAuth, (req, res) => {
  res.status(501).json({ code: 'NOT_IMPLEMENTED', message: 'Simulation non implémentée en Phase 0' });
});

module.exports = { simulateRouter };


