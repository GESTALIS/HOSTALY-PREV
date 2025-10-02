const { Router } = require('express');

const healthRouter = Router();

healthRouter.get('/', (req: any, res: any) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = { healthRouter };

// Traiter ce fichier comme un module
export {};


