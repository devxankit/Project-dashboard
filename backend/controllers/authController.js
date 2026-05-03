const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logActivity } = require('../services/activityService');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Public: List all master admins (tenants) — only name + id exposed
exports.getPublicTenants = async (req, res) => {
  try {
    const tenants = await User.find({ role: 'MASTER_ADMIN' })
      .select('_id name')
      .sort({ createdAt: 1 });
    res.json(tenants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Public: Register a new Master Admin (creates a new tenant)
exports.registerMasterAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });

    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({
      name,
      email,
      password,
      role: 'MASTER_ADMIN',
      permissions: ['read', 'write', 'admin'],
    });

    // tenantId = own _id (this user IS the tenant root)
    user.tenantId = user._id;
    await user.save();

    const token = generateToken(user._id);
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user._id);
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.json(req.user);
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (email) {
      const existing = await User.findOne({ email });
      if (existing && existing._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email;
    }

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password incorrect' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// List admins scoped to the current master admin's tenant
exports.getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ tenantId: req.user.tenantId })
      .select('-password')
      .sort({ createdAt: 1 });
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create admin under the current master admin's tenant
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password, role, permissions } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });

    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'ADMIN',
      permissions: permissions || ['read'],
      tenantId: req.user.tenantId,
    });

    await logActivity({
      tenantId: req.user.tenantId,
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'CREATE_ADMIN',
      target: user.name,
    });

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update admin — only within same tenant
exports.updateAdmin = async (req, res) => {
  try {
    const { role, permissions } = req.body;
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ message: 'Cannot change your own role/permissions' });

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      { role, permissions },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    await logActivity({
      tenantId: req.user.tenantId,
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'UPDATE_ADMIN_ACCESS',
      target: user.name,
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete admin — only within same tenant
exports.deleteAdmin = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ message: 'Cannot delete yourself' });

    const user = await User.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.user.tenantId,
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    await logActivity({
      tenantId: req.user.tenantId,
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'DELETE_ADMIN',
      target: user.name,
    });
    res.json({ message: 'Admin deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
