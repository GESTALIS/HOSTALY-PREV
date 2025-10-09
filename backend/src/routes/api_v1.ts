const { Router } = require('express');
const { healthRouter } = require('./health');
const { authRouter } = require('./auth');
const { scenariosRouter } = require('./scenarios');
const { calendarRouter } = require('./calendar');
const { resultsRouter } = require('./results');
const { simulateRouter } = require('./simulate');
const { router: planningRouter } = require('./planning');
const { router: leavesRouter } = require('./leaves');
const rhRouter = require('./rh');

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/scenarios', scenariosRouter);
router.use('/calendar', calendarRouter);
router.use('/results', resultsRouter);
router.use('/simulate', simulateRouter);
router.use('/planning', planningRouter);
router.use('/leaves', leavesRouter);
router.use('/rh', rhRouter);

module.exports = { router };


