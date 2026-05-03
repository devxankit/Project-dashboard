const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { requireMasterAdmin } = require('../middleware/roleCheck');

// Public
router.get('/tenants', ctrl.getPublicTenants);
router.post('/register', ctrl.registerMasterAdmin);
router.post('/login', ctrl.login);

// Protected (All Admins)
router.get('/me', protect, ctrl.getMe);
router.patch('/profile', protect, ctrl.updateProfile);
router.patch('/password', protect, ctrl.updatePassword);

// Master Admin Only
router.get('/admins', protect, requireMasterAdmin, ctrl.getAdmins);
router.post('/admins', protect, requireMasterAdmin, ctrl.createAdmin);
router.patch('/admins/:id', protect, requireMasterAdmin, ctrl.updateAdmin);
router.delete('/admins/:id', protect, requireMasterAdmin, ctrl.deleteAdmin);

module.exports = router;
