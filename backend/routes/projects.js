const router = require('express').Router();
const ctrl = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/accessCheck');

router.get('/public', ctrl.getPublicProjects);
router.get('/', protect, ctrl.getProjects);
router.post('/', protect, requirePermission('write'), ctrl.createProject);
router.patch('/:id', protect, requirePermission('write'), ctrl.updateProject);
router.delete('/:id', protect, requirePermission('write'), ctrl.deleteProject);

module.exports = router;
