const router = require('express').Router();
const ctrl = require('../controllers/statsController');
const { protect } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');

router.get('/', protect, requireAdmin, ctrl.getDashboardStats);

module.exports = router;
