const router = require('express').Router();
const ctrl = require('../controllers/application.controller');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const upload = require('../middleware/upload');

router.get('/', auth, authorize('ADMIN'), ctrl.getApplications);
router.get('/:id', auth, authorize('ADMIN'), ctrl.getApplication);
router.post('/apply', upload.single('resume'), ctrl.apply);
router.put('/:id/status', auth, authorize('ADMIN'), ctrl.updateStatus);

module.exports = router;
