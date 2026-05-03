const ProjectType = require('../models/ProjectType');
const { logActivity } = require('../services/activityService');

exports.getProjectTypes = async (req, res) => {
  try {
    const types = await ProjectType.find({ tenantId: req.user.tenantId }).sort({ createdAt: 1 });
    res.json(types);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createProjectType = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const projectType = await ProjectType.create({ name, createdBy: req.user._id, tenantId: req.user.tenantId });

    await logActivity({
      tenantId: req.user.tenantId,
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'CREATE_PROJECT_TYPE',
      target: projectType.name,
    });

    res.status(201).json(projectType);
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ message: 'Project type name already exists' });
    res.status(500).json({ message: err.message });
  }
};

exports.updateProjectType = async (req, res) => {
  try {
    const { tenantId: _t, ...updateData } = req.body;
    const projectType = await ProjectType.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      updateData,
      { new: true }
    );
    if (!projectType) return res.status(404).json({ message: 'Project type not found' });

    await logActivity({
      tenantId: req.user.tenantId,
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'UPDATE_PROJECT_TYPE',
      target: projectType.name,
    });

    res.json(projectType);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProjectType = async (req, res) => {
  try {
    const projectType = await ProjectType.findOneAndDelete({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!projectType) return res.status(404).json({ message: 'Project type not found' });

    await logActivity({
      tenantId: req.user.tenantId,
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'DELETE_PROJECT_TYPE',
      target: projectType.name,
    });

    res.json({ message: 'Project type deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
