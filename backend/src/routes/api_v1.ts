import { Router } from 'express';
import { healthRouter } from './health.js';
import { authRouter } from './auth.js';
import { scenariosRouter } from './scenarios.js';
import { calendarRouter } from './calendar.js';
import { resultsRouter } from './results.js';
import { simulateRouter } from './simulate.js';
import rhRouter from './rh.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/scenarios', scenariosRouter);
router.use('/calendar', calendarRouter);
router.use('/results', resultsRouter);
router.use('/simulate', simulateRouter);
router.use('/rh', rhRouter);

export { router };


