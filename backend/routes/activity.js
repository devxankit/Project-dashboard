const router = require('express').Router();
const ctrl = require('../controllers/activityController');
const { protect } = require('../middleware/auth');

router.get('/', protect, ctrl.getLogs);

module.exports = router;
