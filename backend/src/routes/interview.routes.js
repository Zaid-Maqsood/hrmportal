const router = require('express').Router();
const ctrl = require('../controllers/interview.controller');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get('/', auth, authorize('ADMIN', 'EMPLOYEE'), ctrl.getInterviews);
router.post('/', auth, authorize('ADMIN'), ctrl.createInterview);
router.put('/:id', auth, authorize('ADMIN', 'EMPLOYEE'), ctrl.updateInterview);
router.delete('/:id', auth, authorize('ADMIN'), ctrl.deleteInterview);

module.exports = router;
