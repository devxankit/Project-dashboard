const ActivityLog = require('../models/ActivityLog');

const logActivity = async ({ tenantId, adminId, adminName, action, target, changes = null }) => {
  try {
    await ActivityLog.create({ tenantId, adminId, adminName, action, target, changes });
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
};

module.exports = { logActivity };
