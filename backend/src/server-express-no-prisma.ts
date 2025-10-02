require('dotenv/config');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const pino = require('pino');
const pinoHttp = require('pino-http');
const { v4: uuidv4 } = require('uuid');

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err) => {
  console.error('[unhandledRejection]', err);
});
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
});
process.on('SIGTERM', () => {
  console.log('[signal] SIGTERM reçu, arrêt propre...');
  process.exit(0);
});

const app = express();

// Security
app.disable('x-powered-by');
app.use(helmet());

// CORS (restricted)
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5174';
app.use(cors({ origin: corsOrigin, credentials: true }));

// Rate limit
const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60000);
const max = Number(process.env.RATE_LIMIT_MAX || 100);
app.use(rateLimit({ windowMs, max, standardHeaders: true, legacyHeaders: false }));

// Body parser
app.use(express.json());

// Logger with requestId
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
app.use(
  pinoHttp({
    logger,
    genReqId: (req: any) => (req.headers['x-request-id'] || uuidv4()),
    customProps: (req: any) => ({ requestId: req.id }),
  })
);

// Health check endpoint (critique pour Render)
app.get('/healthz', (req: any, res: any) => {
  res.status(200).send('ok');
});

// Route de test Express
app.get('/test', (req: any, res: any) => {
  res.json({
    message: "Express Server OK - No Prisma yet",
    routes: ["/healthz", "/test", "/api/v1/rh/employees (mock)"],
    version: "express-no-prisma"
  });
});

// Routes API mockées sans Prisma (pour tester que Express fonctionne)
app.get('/api/v1/rh/employees', (req: any, res: any) => {
  // Mock data - aucune logique métier changée, juste données factices pour test
  res.json({
    success: true,
    data: [
      {
        id: 1,
        firstName: "Jean",
        lastName: "Dupont",
        contractType: "CDI",
        weeklyHours: 35,
        isActive: true,
        // Colonnes manquantes simulées avec valeurs par défaut
        fullName: "Jean Dupont",
        compensationMode: "HOURLY",
        grossHourlyRate: 15.0,
        employerChargeRateFactor: 1.25
      }
    ],
    message: "Mock data - Prisma not initialized yet"
  });
});

// Error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  const status = err.status || 500;
  const payload: any = {
    code: err.code || (status === 500 ? 'INTERNAL_SERVER_ERROR' : 'ERROR'),
    message: err.message || 'Une erreur est survenue',
  };
  if (process.env.NODE_ENV !== 'production' && err.details) {
    payload.details = err.details;
  }
  res.status(status).json(payload);
});

const port = Number(process.env.PORT || 3002);

console.log(`[EXPRESS-TEST] PORT=${port}`);
console.log(`[EXPRESS-TEST] NODE_ENV=${process.env.NODE_ENV}`);
console.log(`[EXPRESS-TEST] Starting Express server WITHOUT Prisma...`);

// Démarrer le serveur
function startServer() {
  try {
    console.log(`[EXPRESS-TEST] Starting server on 0.0.0.0:${port}`);
    app.listen(port, '0.0.0.0', () => {
      console.log(`[EXPRESS-TEST] ✅ Successfully listening on http://0.0.0.0:${port}`);
      console.log(`[EXPRESS-TEST] 📋 Available routes:`);
      console.log(`[EXPRESS-TEST] - GET /healthz`);
      console.log(`[EXPRESS-TEST] - GET /test`);
      console.log(`[EXPRESS-TEST] - GET /api/v1/rh/employees (mock)`);
    });
  } catch (err) {
    console.error('[EXPRESS-TEST] ❌ Error starting server:', err);
    process.exit(1);
  }
}

startServer();

// Traiter ce fichier comme un module
export {};
