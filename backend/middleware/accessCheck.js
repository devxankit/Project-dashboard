const requirePermission = (permission) => {
  return (req, res, next) => {
    // Master Admin always has full access
    if (req.user?.role === 'MASTER_ADMIN') {
      return next();
    }

    if (!req.user?.permissions?.includes(permission)) {
      return res.status(403).json({
        message: `Permission denied. Required access: ${permission}`,
      });
    }

    next();
  };
};

module.exports = { requirePermission };
