const Project = require('../models/Project');
const Status = require('../models/Status');
const ProjectType = require('../models/ProjectType');
const { logActivity } = require('../services/activityService');

const populate = (query) =>
  query
    .populate('status', 'name color')
    .populate('projectType', 'name')
    .populate('assignedPeople', 'name email role')
    .populate('createdBy', 'name email');

exports.getProjects = async (req, res) => {
  try {
    const projects = await populate(
      Project.find({ tenantId: req.user.tenantId }).sort({ sequence: 1, createdAt: -1 })
    );
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPublicProjects = async (req, res) => {
  try {
    const filter = req.query.tenantId ? { tenantId: req.query.tenantId } : {};
    const projects = await Project.find(filter)
      .sort({ sequence: 1, createdAt: -1 })
      .populate('status', 'name color')
      .populate('projectType', 'name')
      .populate('assignedPeople', 'name role')
      .select('-createdBy');
    res.json(projects);
  } catch (err) {
    console.error('Error fetching public projects:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    const { name, startDate, deadline, status, projectType, assignedPeople, remarks, progress, priority, sequence } = req.body;
    if (!name || !startDate || !deadline || !status || !projectType)
      return res.status(400).json({ message: 'name, startDate, deadline, status and projectType are required' });

    let completedAt = null;
    const statusDoc = await Status.findById(status);
    if (statusDoc && statusDoc.name.toLowerCase() === 'completed') {
      completedAt = new Date();
    }

    const project = await Project.create({
      name, startDate, deadline, status, projectType,
      assignedPeople: assignedPeople || [],
      remarks: remarks || '',
      progress: progress || 0,
      priority: priority || 'normal',
      sequence: sequence || 0,
      createdBy: req.user._id,
      tenantId: req.user.tenantId,
      completedAt,
    });

    const populated = await populate(Project.findById(project._id));

    await logActivity({
      tenantId: req.user.tenantId,
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'CREATE_PROJECT',
      target: project.name,
    });

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const old = await Project.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!old) return res.status(404).json({ message: 'Project not found' });

    const tracked = ['name', 'startDate', 'deadline', 'status', 'projectType', 'progress', 'remarks', 'priority', 'sequence'];
    const changes = {};
    tracked.forEach((key) => {
      if (req.body[key] !== undefined) {
        let isChanged = false;
        const oldVal = old[key];
        const newVal = req.body[key];

        if (oldVal == null || newVal == null) {
          isChanged = String(oldVal) !== String(newVal);
        } else if (['startDate', 'deadline'].includes(key)) {
          const oldTime = new Date(oldVal).getTime();
          const newTime = new Date(newVal).getTime();
          isChanged = !isNaN(oldTime) && !isNaN(newTime) ? oldTime !== newTime : String(oldVal) !== String(newVal);
        } else {
          isChanged = String(oldVal) !== String(newVal);
        }

        if (isChanged) {
          changes[key] = { from: oldVal, to: newVal };
        }
      }
    });

    if (req.body.status) {
      const statusDoc = await Status.findById(req.body.status);
      if (statusDoc && statusDoc.name.toLowerCase() === 'completed') {
        if (!old.completedAt) {
          req.body.completedAt = new Date();
        }
      } else {
        req.body.completedAt = null;
      }
    }

    // Prevent overwriting tenantId via request body
    const { tenantId: _t, ...updateData } = req.body;

    const project = await populate(
      Project.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
    );

    try {
      if (changes.status) {
        const fromStatus = changes.status.from ? await Status.findById(changes.status.from) : null;
        const toStatus = changes.status.to ? await Status.findById(changes.status.to) : null;
        changes.status = {
          from: fromStatus?.name || (changes.status.from ? 'Unknown Status' : 'None'),
          to: toStatus?.name || 'Unknown Status'
        };
      }
      if (changes.projectType) {
        const fromType = changes.projectType.from ? await ProjectType.findById(changes.projectType.from) : null;
        const toType = changes.projectType.to ? await ProjectType.findById(changes.projectType.to) : null;
        changes.projectType = {
          from: fromType?.name || (changes.projectType.from ? 'Unknown Type' : 'None'),
          to: toType?.name || 'Unknown Type'
        };
      }

      const isOnlyStatus = Object.keys(changes).length === 1 && changes.status;

      await logActivity({
        tenantId: req.user.tenantId,
        adminId: req.user?._id,
        adminName: req.user?.name || 'Admin',
        action: isOnlyStatus ? 'PROJECT_STATUS_CHANGE' : 'UPDATE_PROJECT',
        target: project?.name || 'Unknown Project',
        changes: Object.keys(changes).length > 0 ? changes : null,
      });
    } catch (logErr) {
      console.error('Logging resolution error:', logErr.message);
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    await logActivity({
      tenantId: req.user.tenantId,
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'DELETE_PROJECT',
      target: project.name,
    });

    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
