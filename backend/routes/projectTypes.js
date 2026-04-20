const router = require('express').Router();
const ctrl = require('../controllers/projectTypeController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/accessCheck');

router.get('/', protect, ctrl.getProjectTypes);
router.post('/', protect, requirePermission('write'), ctrl.createProjectType);
router.patch('/:id', protect, requirePermission('write'), ctrl.updateProjectType);
router.delete('/:id', protect, requirePermission('write'), ctrl.deleteProjectType);

module.exports = router;
