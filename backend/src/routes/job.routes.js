const router = require('express').Router();
const ctrl = require('../controllers/job.controller');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get('/', ctrl.getJobs);
router.get('/:id', ctrl.getJob);
router.post('/', auth, authorize('ADMIN'), ctrl.createJob);
router.put('/:id', auth, authorize('ADMIN'), ctrl.updateJob);
router.delete('/:id', auth, authorize('ADMIN'), ctrl.deleteJob);

module.exports = router;
