const router = require('express').Router();
const ctrl = require('../controllers/task.controller');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get('/', auth, authorize('ADMIN', 'EMPLOYEE'), ctrl.getTasks);
router.post('/', auth, authorize('ADMIN'), ctrl.createTask);
router.put('/:id', auth, authorize('ADMIN', 'EMPLOYEE'), ctrl.updateTask);
router.delete('/:id', auth, authorize('ADMIN'), ctrl.deleteTask);

module.exports = router;
