const router = require('express').Router();
const ctrl = require('../controllers/statusController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/accessCheck');

router.get('/', protect, ctrl.getStatuses);
router.post('/', protect, requirePermission('write'), ctrl.createStatus);
router.patch('/:id', protect, requirePermission('write'), ctrl.updateStatus);
router.delete('/:id', protect, requirePermission('write'), ctrl.deleteStatus);

module.exports = router;
