require('dotenv/config');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const pino = require('pino');
const pinoHttp = require('pino-http');
const { v4: uuidv4 } = require('uuid');
const { router: apiRouter } = require('./routes/api_v1');

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

// Health check
app.get('/healthz', (req, res) => {
  res.status(200).json({ ok: true });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'HOTALY-PREV API',
    version: '1.0.0',
    status: 'running'
  });
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
app.listen(port, '0.0.0.0', () => {
  console.log(`API démarrée sur http://localhost:${port}`);
  console.log(`Access réseau : http://192.168.1.57:${port}`);
});


