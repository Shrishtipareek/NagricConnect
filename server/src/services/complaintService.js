const Complaint = require('../models/Complaint');
const ComplaintUpdate = require('../models/ComplaintUpdate');

/**
 * Build filter query for admin complaint listing
 */
const buildComplaintFilter = (query) => {
  const filter = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.category) {
    filter.category = query.category;
  }

  if (query.ward) {
    filter['location.ward'] = query.ward;
  }

  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [
      { complaintId: searchRegex },
      { title: searchRegex },
      { description: searchRegex },
      { 'location.address': searchRegex },
    ];
  }

  if (query.dateFrom || query.dateTo) {
    filter.createdAt = {};
    if (query.dateFrom) {
      filter.createdAt.$gte = new Date(query.dateFrom);
    }
    if (query.dateTo) {
      filter.createdAt.$lte = new Date(query.dateTo + 'T23:59:59.999Z');
    }
  }

  return filter;
};

/**
 * Get complaint statistics
 */
const getComplaintStats = async (villageId) => {
  const stats = await Complaint.aggregate([
    {
      $match: { villageId }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const result = {
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  };

  stats.forEach((s) => {
    result.total += s.count;
    if (s._id === 'PENDING') result.pending = s.count;
    if (s._id === 'IN_PROGRESS') result.inProgress = s.count;
    if (s._id === 'COMPLETED') result.completed = s.count;
  });

  return result;
};

/**
 * Get complaints grouped by category
 */
const getComplaintsByCategory = async (villageId) => {
  return Complaint.aggregate([
    {
      $match: { villageId }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

/**
 * Get complaints grouped by ward
 */
const getComplaintsByWard = async (villageId) => {
  return Complaint.aggregate([
    {
      $match: { 'location.ward': { $ne: '' }, villageId }
    },
    {
      $group: {
        _id: '$location.ward',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

/**
 * Get complaints over time (monthly for last 12 months)
 */
const getComplaintsOverTime = async (villageId) => {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  return Complaint.aggregate([
    {
      $match: { createdAt: { $gte: twelveMonthsAgo }, villageId }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 },
    },
  ]);
};

/**
 * Get average resolution time in days
 */
const getAverageResolutionTime = async (villageId) => {
  const result = await Complaint.aggregate([
    {
      $match: { status: 'COMPLETED', resolvedAt: { $ne: null }, villageId }
    },
    {
      $project: {
        resolutionTime: {
          $divide: [
            { $subtract: ['$resolvedAt', '$createdAt'] },
            1000 * 60 * 60 * 24, // Convert ms to days
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        avgDays: { $avg: '$resolutionTime' },
      },
    },
  ]);

  return result.length > 0 ? Math.round(result[0].avgDays * 10) / 10 : 0;
};

/**
 * Get recurring problems (category+ward combos with high complaint counts)
 */
const getRecurringProblems = async (villageId) => {
  return Complaint.aggregate([
    {
      $match: { 'location.ward': { $ne: '' }, villageId }
    },
    {
      $group: {
        _id: {
          category: '$category',
          ward: '$location.ward',
        },
        count: { $sum: 1 },
      },
    },
    {
      $match: { count: { $gte: 2 } },
    },
    {
      $sort: { count: -1 },
    },
    {
      $limit: 10,
    },
    {
      $project: {
        category: '$_id.category',
        ward: '$_id.ward',
        count: 1,
        _id: 0,
      },
    },
  ]);
};

module.exports = {
  buildComplaintFilter,
  getComplaintStats,
  getComplaintsByCategory,
  getComplaintsByWard,
  getComplaintsOverTime,
  getAverageResolutionTime,
  getRecurringProblems,
};
