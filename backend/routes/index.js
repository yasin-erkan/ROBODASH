const {Router} = require('express');
const {getHealth} = require('../controllers/healthController');
const {getFleetHandler} = require('../controllers/fleetController');
const {getHistory} = require('../controllers/telemetryController');
const {getLogs} = require('../controllers/logsController');
const {postCommand} = require('../controllers/commandsController');
const {login} = require('../controllers/authController');
const {authMiddleware, requireRole} = require('../middleware/auth');

const router = Router();

router.post('/auth/login', login);
router.get('/health', getHealth);
router.get('/fleet', getFleetHandler);
router.get('/telemetry-history', getHistory);
router.get('/logs', getLogs);
router.post(
  '/robots/:robotId/command',
  authMiddleware,
  requireRole('operator', 'admin'),
  postCommand,
);

module.exports = router;
