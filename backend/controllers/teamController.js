const TeamMember = require('../models/TeamMember');
const { logActivity } = require('../services/activityService');

exports.getTeam = async (req, res) => {
  try {
    const members = await TeamMember.find({ tenantId: req.user.tenantId }).sort({ createdAt: -1 });
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'Name and email are required' });

    const member = await TeamMember.create({
      name, email, role,
      addedBy: req.user._id,
      tenantId: req.user.tenantId,
    });

    await logActivity({
      tenantId: req.user.tenantId,
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'ADD_MEMBER',
      target: member.name,
    });

    res.status(201).json(member);
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ message: 'Email already exists' });
    res.status(500).json({ message: err.message });
  }
};

exports.updateMember = async (req, res) => {
  try {
    const { tenantId: _t, ...updateData } = req.body;
    const member = await TeamMember.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      updateData,
      { new: true }
    );
    if (!member) return res.status(404).json({ message: 'Member not found' });

    await logActivity({
      tenantId: req.user.tenantId,
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'UPDATE_MEMBER',
      target: member.name,
    });

    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteMember = async (req, res) => {
  try {
    const member = await TeamMember.findOneAndDelete({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!member) return res.status(404).json({ message: 'Member not found' });

    await logActivity({
      tenantId: req.user.tenantId,
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'DELETE_MEMBER',
      target: member.name,
    });

    res.json({ message: 'Member removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
