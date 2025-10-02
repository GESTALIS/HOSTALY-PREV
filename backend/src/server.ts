require('dotenv/config');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const pino = require('pino');
const pinoHttp = require('pino-http');
const { v4: uuidv4 } = require('uuid');
const { router: apiRouter } = require('./routes/api_v1');

// Lancer les migrations en arrière-plan après le démarrage
async function runMigrationsInBackground() {
  setTimeout(async () => {
    try {
      console.log('🔧 Running database migrations in background...');
      const { spawn } = require('child_process');
      
      // Exécuter les migrations via spawn (non-bloquant)
      const migrateProcess = spawn('npx', ['prisma', 'migrate', 'deploy'], {
        cwd: '/app',
        stdio: 'inherit',
        env: process.env
      });
      
      migrateProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Database migrations completed');
        } else {
          console.log('❌ Migrations failed but server continues running');
        }
      });
      
      migrateProcess.on('error', (error) => {
        console.log('❌ Migration process error:', error.message);
      });
    } catch (error) {
      console.log('❌ Migration failed:', error.message);
    }
  }, 2000); // Attendre 2 secondes
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

// Démarrer le serveur
function startServer() {
  app.listen(port, () => {
    console.log(`API démarrée sur http://localhost:${port}`);
    // Lancer les migrations en arrière-plan après le démarrage
    runMigrationsInBackground();
  });
}

startServer();

// Traiter ce fichier comme un module
export {};


