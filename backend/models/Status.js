const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    color: { type: String, default: '#6366f1' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Unique name per tenant (replaces global unique constraint)
statusSchema.index({ name: 1, tenantId: 1 }, { unique: true });

module.exports = mongoose.model('Status', statusSchema);
