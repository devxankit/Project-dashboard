const requireMasterAdmin = (req, res, next) => {
  if (req.user?.role !== 'MASTER_ADMIN') {
    return res.status(403).json({ message: 'Access denied. MASTER_ADMIN only.' });
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!['MASTER_ADMIN', 'ADMIN'].includes(req.user?.role)) {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

module.exports = { requireMasterAdmin, requireAdmin };
