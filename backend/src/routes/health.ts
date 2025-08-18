const { Router } = require('express');

const healthRouter = Router();

healthRouter.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = { healthRouter };


