const Project = require('../models/Project');
const Status = require('../models/Status');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    
    // Status breakdown (all statuses)
    const allStatuses = await Status.find().lean();
    const projectStatusCounts = await Project.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusStats = allStatuses.map(s => {
      const match = projectStatusCounts.find(pc => String(pc._id) === String(s._id));
      return {
        _id: s._id,
        name: s.name,
        color: s.color,
        count: match ? match.count : 0
      };
    });

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
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const growthRaw = await Project.aggregate([
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
      }
    ]);

    // Fill gaps for growthStats
    const growthStats = [];
    for (let i = 0; i < 6; i++) {
        const d = new Date(sixMonthsAgo);
        d.setMonth(d.getMonth() + i);
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        const found = growthRaw.find(g => g._id.year === year && g._id.month === month);
        growthStats.push({
            month: d.toLocaleString('default', { month: 'short' }),
            count: found ? found.count : 0
        });
    }

    // High stress project count (Urgent or Overdue)
    const urgentCount = await Project.countDocuments({ priority: 'urgent' });

    // Average progress calculation
    const progressStats = await Project.aggregate([
      {
        $group: {
          _id: null,
          avg: { $avg: '$progress' }
        }
      }
    ]);
    const avgProgress = (progressStats.length > 0 && progressStats[0].avg != null) 
      ? Math.round(progressStats[0].avg) 
      : 0;
    
    // Sort Priority Stats
    const priorityOrder = ['low', 'normal', 'high', 'urgent'];
    const sortedPriorityStats = priorityOrder.map(p => {
        const found = priorityStats.find(ps => ps._id === p);
        return { _id: p, count: found ? found.count : 0 };
    });

    res.json({
      summary: {
        totalProjects,
        urgentCount,
        recentCount: await Project.countDocuments({ 
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
        }),
        avgProgress
      },
      statusStats,
      priorityStats: sortedPriorityStats,
      growthStats
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
