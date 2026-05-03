const ActivityLog = require('../models/ActivityLog');

exports.getLogs = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 200);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const filter = { tenantId: req.user.tenantId };

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ActivityLog.countDocuments(filter),
    ]);

    res.json({ logs, total, page, limit });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
