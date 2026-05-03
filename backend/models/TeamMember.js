const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, default: 'Developer', trim: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Unique email per tenant (replaces global unique constraint)
teamMemberSchema.index({ email: 1, tenantId: 1 }, { unique: true });

module.exports = mongoose.model('TeamMember', teamMemberSchema);
