require('dotenv/config');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const pino = require('pino');
const pinoHttp = require('pino-http');
const { v4: uuidv4 } = require('uuid');
const { router: apiRouter } = require('./routes/api_v1');

// Migration automatique désactivée pour éviter les SIGTERM
// Utiliser script séparé pour les migrations si nécessaire

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

// Route de diagnostic PostgreSQL direct (sans Prisma)
app.get('/postgres-test', async (req: any, res: any) => {
  try {
    // Utiliser PostgreSQL direct sans Prisma pour le debug
    const { Client } = require('pg');
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();
    console.log('[POSTGRES-TEST] Connexion réussie');

    // Tester la structure des tables
    const tableInfo = await client.query(`
      SELECT 
        table_name,
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'Employee' 
      ORDER BY ordinal_position
    `);

    await client.end();

    res.json({
      success: true,
      message: "Connexion PostgreSQL OK",
      database: {
        employeeColumns: tableInfo.rows,
        connectionStatus: "OK",
        databaseUrl: process.env.DATABASE_URL ? 'Present' : 'Missing'
      }
    });

  } catch (error: any) {
    console.error('[POSTGRES-TEST] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      errorCode: error.code,
      stack: error.stack,
      message: "Erreur PostgreSQL détaillée"
    });
  }
});

// Route temporaire pour appliquer les migrations manuelles Render  
app.post('/fix-render-columns', async (req: any, res: any) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    // Essayer d'abord un ALTER simple
    await prisma.$executeRaw`ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "fullName" TEXT DEFAULT ''`;
    
    await prisma.$disconnect();

    res.json({
      success: true,
      message: "Migration débutée - colonne fullName ajoutée"
    });

  } catch (error: any) {
    console.error('[FIX-RENDER] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      errorCode: error.code,
      message: "Erreur lors de l'application de la migration Render"
    });
  }
});

// Routes
app.use('/api/v1', apiRouter);

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

console.log(`[CONFIG] PORT=${port}`);
console.log(`[CONFIG] NODE_ENV=${process.env.NODE_ENV}`);
console.log(`[CONFIG] DATABASE_URL present=${!!process.env.DATABASE_URL}`);

// Démarrer le serveur
function startServer() {
  try {
    console.log(`[CONFIG] Starting server on 0.0.0.0:${port}`);
    app.listen(port, '0.0.0.0', () => {
      console.log(`[SERVER] ✅ Successfully listening on http://0.0.0.0:${port}`);
    });
  } catch (err) {
    console.error('[SERVER] ❌ Error starting server:', err);
    process.exit(1);
  }
}

startServer();

// Traiter ce fichier comme un module
export {};


