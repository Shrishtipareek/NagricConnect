const Notice = require('../models/Notice');

/**
 * GET /api/notices
 * Get all published notices (public)
 */
const getPublishedNotices = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = { isPublished: true, villageId: req.user.villageId };

    // Filter by category
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Filter out expired notices
    filter.$or = [
      { expiresAt: null },
      { expiresAt: { $gte: new Date() } },
    ];

    const [notices, total] = await Promise.all([
      Notice.find(filter)
        .populate('publishedBy', 'name')
        .sort({ priority: -1, publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notice.countDocuments(filter),
    ]);

    // Sort so URGENT comes first, then IMPORTANT, then NORMAL
    const priorityOrder = { URGENT: 0, IMPORTANT: 1, NORMAL: 2 };
    notices.sort((a, b) => (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2));

    res.status(200).json({
      success: true,
      data: {
        notices,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/notices/:id
 * Get single notice
 */
const getNoticeById = async (req, res, next) => {
  try {
    const notice = await Notice.findOne({
      _id: req.params.id,
      isPublished: true,
      villageId: req.user.villageId,
    }).populate('publishedBy', 'name');

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: { notice },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublishedNotices,
  getNoticeById,
};
