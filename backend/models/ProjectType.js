const mongoose = require('mongoose');

const projectTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Unique name per tenant (replaces global unique constraint)
projectTypeSchema.index({ name: 1, tenantId: 1 }, { unique: true });

module.exports = mongoose.model('ProjectType', projectTypeSchema);
