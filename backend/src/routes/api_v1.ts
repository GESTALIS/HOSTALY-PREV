import { Router } from 'express';
import { healthRouter } from './health';
import { authRouter } from './auth';
import { scenariosRouter } from './scenarios';
import { calendarRouter } from './calendar';
import { resultsRouter } from './results';
import { simulateRouter } from './simulate';
import rhRouter from './rh';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/scenarios', scenariosRouter);
router.use('/calendar', calendarRouter);
router.use('/results', resultsRouter);
router.use('/simulate', simulateRouter);
router.use('/rh', rhRouter);

export { router };


