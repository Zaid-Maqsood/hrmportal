const router = require('express').Router();
const { getStats } = require('../controllers/dashboard.controller');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get('/stats', auth, authorize('ADMIN'), getStats);

module.exports = router;
