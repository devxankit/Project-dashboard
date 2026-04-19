const Project = require('../models/Project');
const Status = require('../models/Status');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    
    // Status breakdown
    const statusStats = await Project.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'statuses',
          localField: '_id',
          foreignField: '_id',
          as: 'statusInfo'
        }
      },
      {
        $unwind: '$statusInfo'
      },
      {
        $project: {
          name: '$statusInfo.name',
          color: '$statusInfo.color',
          count: 1
        }
      }
    ]);

    // Priority breakdown
    const priorityStats = await Project.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Growth (Projects per month for the last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const growthStats = await Project.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // High stress project count (Urgent or Overdue)
    const urgentCount = await Project.countDocuments({ priority: 'urgent' });
    
    res.json({
      summary: {
        totalProjects,
        urgentCount,
        recentCount: await Project.countDocuments({ 
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
        })
      },
      statusStats,
      priorityStats,
      growthStats: growthStats.map(g => ({
        month: new Date(g._id.year, g._id.month - 1).toLocaleString('default', { month: 'short' }),
        count: g.count
      }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
