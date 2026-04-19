const Project = require('../models/Project');
const { logActivity } = require('../services/activityService');

const populate = (query) =>
  query
    .populate('status', 'name color')
    .populate('assignedPeople', 'name email role')
    .populate('createdBy', 'name email');

exports.getProjects = async (req, res) => {
  try {
    const projects = await populate(Project.find().sort({ sequence: 1, createdAt: -1 }));
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPublicProjects = async (req, res) => {
  try {
    // Only fetch fields that are safe for public viewing
    const projects = await Project.find()
      .sort({ sequence: 1, createdAt: -1 })
      .populate('status', 'name color')
      .populate('assignedPeople', 'name role') // No emails for public
      .select('-createdBy'); // Hide creator details but show remarks for detail view
    res.json(projects);
  } catch (err) {
    console.error('Error fetching public projects:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    const { name, startDate, deadline, status, assignedPeople, remarks, progress, priority, sequence } = req.body;
    if (!name || !startDate || !deadline || !status)
      return res.status(400).json({ message: 'name, startDate, deadline and status are required' });

    const project = await Project.create({
      name, startDate, deadline, status,
      assignedPeople: assignedPeople || [],
      remarks: remarks || '',
      progress: progress || 0,
      priority: priority || 'normal',
      sequence: sequence || 0,
      createdBy: req.user._id,
    });

    const populated = await populate(Project.findById(project._id));

    await logActivity({
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
    const old = await Project.findById(req.params.id);
    if (!old) return res.status(404).json({ message: 'Project not found' });

    const tracked = ['name', 'startDate', 'deadline', 'status', 'progress', 'remarks', 'priority', 'sequence'];
    const changes = {};
    tracked.forEach((key) => {
      if (req.body[key] !== undefined &&
          String(old[key]) !== String(req.body[key])) {
        changes[key] = { from: old[key], to: req.body[key] };
      }
    });

    const project = await populate(
      Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    );

    await logActivity({
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'UPDATE_PROJECT',
      target: project.name,
      changes: Object.keys(changes).length > 0 ? changes : null,
    });

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    await logActivity({
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
