const ActivityLog = require('../models/ActivityLog');

const logActivity = async ({ adminId, adminName, action, target, changes = null }) => {
  try {
    await ActivityLog.create({ adminId, adminName, action, target, changes });
  } catch (err) {
    // Non-critical: log errors should not crash the main request
    console.error('Activity log error:', err.message);
  }
};

module.exports = { logActivity };
