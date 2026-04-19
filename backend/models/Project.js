const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    deadline: { type: Date, required: true },
    status: { type: mongoose.Schema.Types.ObjectId, ref: 'Status', required: true },
    assignedPeople: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TeamMember' }],
    remarks: { type: String, default: '' },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
