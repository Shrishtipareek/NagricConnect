const Complaint = require('../models/Complaint');
const ComplaintUpdate = require('../models/ComplaintUpdate');
const User = require('../models/User');
const Notice = require('../models/Notice');
const { isValidObjectId, validateStatusUpdate, validateNotice } = require('../utils/validators');
const { notifyCitizenStatusChange, notifyCitizensNewNotice } = require('../services/notificationService');
const {
  buildComplaintFilter,
  getComplaintStats,
  getComplaintsByCategory,
  getComplaintsByWard,
  getComplaintsOverTime,
  getAverageResolutionTime,
  getRecurringProblems,
} = require('../services/complaintService');

// ==========================================
// DASHBOARD
// ==========================================

/**
 * GET /api/admin/dashboard
 * Admin dashboard data
 */
const getDashboard = async (req, res, next) => {
  try {
    const villageId = req.user.villageId;

    const stats = await getComplaintStats(villageId);
    const totalCitizens = await User.countDocuments({ role: 'CITIZEN', villageId });

    // Recent complaints
    const recentComplaints = await Complaint.find({ villageId })
      .populate('citizen', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Recent notices
    const recentNotices = await Notice.find({ isPublished: true, villageId })
      .sort({ publishedAt: -1 })
      .limit(3)
      .lean();

    // Recurring problems
    const recurringProblems = await getRecurringProblems(villageId);

    res.status(200).json({
      success: true,
      data: {
        stats: { ...stats, totalCitizens },
        recentComplaints,
        recentNotices,
        recurringProblems,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// COMPLAINT MANAGEMENT
// ==========================================

/**
 * GET /api/admin/complaints
 * Get all complaints with filters and pagination
 */
const getAllComplaints = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = buildComplaintFilter(req.query);
    filter.villageId = req.user.villageId; // STRICT ISOLATION

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .populate('citizen', 'name email phone village ward')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Complaint.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        complaints,
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
 * GET /api/admin/complaints/:id
 * Get complaint details (admin view with citizen info)
 */
const getComplaintDetail = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid complaint ID format.',
      });
    }

    const complaint = await Complaint.findOne({
      _id: req.params.id,
      villageId: req.user.villageId,
    }).populate('citizen', 'name email phone village ward');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    const updates = await ComplaintUpdate.find({ complaint: complaint._id })
      .populate('updatedBy', 'name role')
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: { complaint, updates },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/complaints/:id/status
 * Update complaint status
 */
const updateComplaintStatus = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid complaint ID format.',
      });
    }

    const errors = validateStatusUpdate(req.body);
    if (errors.length > 0) {
      return res.status(422).json({
        success: false,
        message: errors.join('. '),
      });
    }

    const { status, message } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    // Update complaint status
    complaint.status = status;
    if (status === 'COMPLETED') {
      complaint.resolvedAt = new Date();
    }
    await complaint.save();

    // Create update record
    const updateImages = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        updateImages.push(`/uploads/${file.filename}`);
      });
    }

    await ComplaintUpdate.create({
      complaint: complaint._id,
      status,
      message: message.trim(),
      updatedBy: req.user._id,
      images: updateImages,
    });

    // Notify citizen
    await notifyCitizenStatusChange(complaint, status);

    res.status(200).json({
      success: true,
      message: `Complaint status updated to ${status}.`,
      data: { complaint },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/complaints/:id/updates
 * Add progress update without changing status
 */
const addComplaintUpdate = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid complaint ID format.',
      });
    }

    if (!req.body.message || !req.body.message.trim()) {
      return res.status(422).json({
        success: false,
        message: 'Update message is required.',
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    const updateImages = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        updateImages.push(`/uploads/${file.filename}`);
      });
    }

    const update = await ComplaintUpdate.create({
      complaint: complaint._id,
      status: complaint.status,
      message: req.body.message.trim(),
      updatedBy: req.user._id,
      images: updateImages,
    });

    res.status(201).json({
      success: true,
      message: 'Progress update added successfully.',
      data: { update },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// USER MANAGEMENT
// ==========================================

/**
 * GET /api/admin/users
 * Get all citizens
 */
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = { role: 'CITIZEN', villageId: req.user.villageId };

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { village: searchRegex },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    // Add complaint count for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const complaintCount = await Complaint.countDocuments({ citizen: user._id });
        return { ...user, complaintCount };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        users: usersWithStats,
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

// ==========================================
// NOTICE MANAGEMENT
// ==========================================

/**
 * GET /api/admin/notices
 * Get all notices (including unpublished)
 */
const getAdminNotices = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [notices, total] = await Promise.all([
      Notice.find({ villageId: req.user.villageId })
        .populate('publishedBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notice.countDocuments({ villageId: req.user.villageId }),
    ]);

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
 * POST /api/admin/notices
 * Create a new notice
 */
const createNotice = async (req, res, next) => {
  try {
    const errors = validateNotice(req.body);
    if (errors.length > 0) {
      return res.status(422).json({
        success: false,
        message: errors.join('. '),
      });
    }

    const { title, content, category, priority, isPublished, expiresAt } = req.body;

    const notice = await Notice.create({
      title: title.trim(),
      content: content.trim(),
      category: category || 'GENERAL',
      priority: priority || 'NORMAL',
      publishedBy: req.user._id,
      villageId: req.user.villageId,
      isPublished: isPublished !== false,
      publishedAt: new Date(),
      expiresAt: expiresAt || null,
    });

    // Notify citizens if important/urgent
    if (notice.isPublished) {
      await notifyCitizensNewNotice(notice);
    }

    res.status(201).json({
      success: true,
      message: 'Notice published successfully.',
      data: { notice },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/notices/:id
 * Update a notice
 */
const updateNotice = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notice ID format.',
      });
    }

    const notice = await Notice.findOne({
      _id: req.params.id,
      villageId: req.user.villageId,
    });
    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found.',
      });
    }

    const { title, content, category, priority, isPublished, expiresAt } = req.body;

    if (title) notice.title = title.trim();
    if (content) notice.content = content.trim();
    if (category) notice.category = category;
    if (priority) notice.priority = priority;
    if (typeof isPublished === 'boolean') notice.isPublished = isPublished;
    if (expiresAt !== undefined) notice.expiresAt = expiresAt;

    await notice.save();

    res.status(200).json({
      success: true,
      message: 'Notice updated successfully.',
      data: { notice },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/notices/:id
 * Delete a notice
 */
const deleteNotice = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notice ID format.',
      });
    }

    const notice = await Notice.findOneAndDelete({
      _id: req.params.id,
      villageId: req.user.villageId,
    });
    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notice deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ANALYTICS
// ==========================================

/**
 * GET /api/admin/analytics
 * Get comprehensive analytics data
 */
const getAnalytics = async (req, res, next) => {
  try {
    const [
      stats,
      byCategory,
      byWard,
      overTime,
      avgResolutionTime,
      recurringProblems,
    ] = await Promise.all([
      getComplaintStats(req.user.villageId),
      getComplaintsByCategory(req.user.villageId),
      getComplaintsByWard(req.user.villageId),
      getComplaintsOverTime(req.user.villageId),
      getAverageResolutionTime(req.user.villageId),
      getRecurringProblems(req.user.villageId),
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats,
        byCategory,
        byWard,
        overTime,
        avgResolutionTime,
        recurringProblems,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getAllComplaints,
  getComplaintDetail,
  updateComplaintStatus,
  addComplaintUpdate,
  getAllUsers,
  getAdminNotices,
  createNotice,
  updateNotice,
  deleteNotice,
  getAnalytics,
};
