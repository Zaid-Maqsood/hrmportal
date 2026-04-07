const router = require('express').Router();
const ctrl = require('../controllers/employee.controller');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get('/', auth, authorize('ADMIN'), ctrl.getEmployees);
router.get('/:id', auth, authorize('ADMIN', 'EMPLOYEE'), ctrl.getEmployee);
router.put('/:id', auth, authorize('ADMIN'), ctrl.updateEmployee);

module.exports = router;
