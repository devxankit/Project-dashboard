const router = require('express').Router();
const ctrl = require('../controllers/teamController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/accessCheck');

router.get('/', protect, ctrl.getTeam);
router.post('/', protect, requirePermission('write'), ctrl.addMember);
router.patch('/:id', protect, requirePermission('write'), ctrl.updateMember);
router.delete('/:id', protect, requirePermission('write'), ctrl.deleteMember);

module.exports = router;
