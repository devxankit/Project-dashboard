const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    adminName: { type: String, required: true },
    action: {
      type: String,
      enum: [
        'CREATE_PROJECT', 'UPDATE_PROJECT', 'DELETE_PROJECT', 'PROJECT_STATUS_CHANGE',
        'CREATE_STATUS', 'UPDATE_STATUS', 'DELETE_STATUS',
        'CREATE_PROJECT_TYPE', 'UPDATE_PROJECT_TYPE', 'DELETE_PROJECT_TYPE',
        'ADD_MEMBER', 'UPDATE_MEMBER', 'DELETE_MEMBER',
        'PROMOTE_USER', 'DEMOTE_USER',
      ],
      required: true,
    },
    target: { type: String, required: true },
    changes: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
