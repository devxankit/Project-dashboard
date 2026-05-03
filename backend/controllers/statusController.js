const Status = require('../models/Status');
const { logActivity } = require('../services/activityService');

exports.getStatuses = async (req, res) => {
  try {
    const statuses = await Status.find({ tenantId: req.user.tenantId }).sort({ createdAt: 1 });
    res.json(statuses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createStatus = async (req, res) => {
  try {
    const { name, color } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const status = await Status.create({ name, color, createdBy: req.user._id, tenantId: req.user.tenantId });

    await logActivity({
      tenantId: req.user.tenantId,
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'CREATE_STATUS',
      target: status.name,
    });

    res.status(201).json(status);
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ message: 'Status name already exists' });
    res.status(500).json({ message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { tenantId: _t, ...updateData } = req.body;
    const status = await Status.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      updateData,
      { new: true }
    );
    if (!status) return res.status(404).json({ message: 'Status not found' });

    await logActivity({
      tenantId: req.user.tenantId,
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'UPDATE_STATUS',
      target: status.name,
    });

    res.json(status);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteStatus = async (req, res) => {
  try {
    const status = await Status.findOneAndDelete({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!status) return res.status(404).json({ message: 'Status not found' });

    await logActivity({
      tenantId: req.user.tenantId,
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'DELETE_STATUS',
      target: status.name,
    });

    res.json({ message: 'Status deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
