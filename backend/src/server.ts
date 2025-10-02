require('dotenv/config');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const pino = require('pino');
const pinoHttp = require('pino-http');
const { v4: uuidv4 } = require('uuid');
const { router: apiRouter } = require('./routes/api_v1');

// Lancer les migrations automatiquement au démarrage
async function runMigrations() {
  try {
    console.log('🔧 Running database migrations...');
    const { spawn } = require('child_process');
    
    // Exécuter les migrations via spawn (plus stable)
    const migrateProcess = spawn('npx', ['prisma', 'migrate', 'deploy'], {
      cwd: '/app',
      stdio: 'inherit',
      env: process.env
    });
    
    // Attendre la fin du processus
    await new Promise((resolve, reject) => {
      migrateProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Database migrations completed');
          resolve(true);
        } else {
          reject(new Error(`Migration process exited with code ${code}`));
        }
      });
      migrateProcess.on('error', reject);
    });
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('⏭️ Continuing without migrations (tables may not exist)');
  }
}

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

// Démarrer le serveur avec les migrations
async function startServer() {
  await runMigrations();
  app.listen(port, () => {
    console.log(`API démarrée sur http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

// Traiter ce fichier comme un module
export {};


