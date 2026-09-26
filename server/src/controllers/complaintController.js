const Complaint = require('../models/Complaint');
const ComplaintUpdate = require('../models/ComplaintUpdate');
const generateComplaintId = require('../utils/generateComplaintId');
const { validateComplaint, validateFeedback, isValidObjectId } = require('../utils/validators');
const { notifySarpanchNewComplaint } = require('../services/notificationService');

/**
 * POST /api/complaints
 * Create a new complaint
 */
const createComplaint = async (req, res, next) => {
  try {
    const errors = validateComplaint(req.body);
    if (errors.length > 0) {
      return res.status(422).json({
        success: false,
        message: errors.join('. '),
      });
    }

    const { title, description, category, address, ward, contactPreference } = req.body;

    // Generate unique complaint ID
    const complaintId = await generateComplaintId();

    // Process uploaded images
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        images.push({
          url: `/uploads/${file.filename}`,
          publicId: file.filename,
        });
      });
    }

    const complaint = await Complaint.create({
      complaintId,
      citizen: req.user._id,
      villageId: req.user.villageId,
      title: title.trim(),
      description: description.trim(),
      category,
      location: {
        address: address ? address.trim() : '',
        ward: ward ? ward.trim() : req.user.ward || '',
      },
      images,
      contactPreference: contactPreference || 'both',
    });

    // Create initial update record
    await ComplaintUpdate.create({
      complaint: complaint._id,
      status: 'PENDING',
      message: 'Complaint submitted successfully.',
      updatedBy: req.user._id,
    });

    // Notify Sarpanch
    await notifySarpanchNewComplaint(complaint);

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully.',
      data: { complaint },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/complaints/my
 * Get current citizen's complaints with pagination
 */
const getMyComplaints = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = { citizen: req.user._id };

    // Optional status filter
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Optional search
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { complaintId: searchRegex },
        { title: searchRegex },
      ];
    }

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
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
 * GET /api/complaints/:id
 * Get single complaint details (citizen can only see their own)
 */
const getComplaintById = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid complaint ID format.',
      });
    }

    const complaint = await Complaint.findById(req.params.id)
      .populate('citizen', 'name village ward');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    // Citizens can only view their own complaints
    if (
      req.user.role === 'CITIZEN' &&
      complaint.citizen._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this complaint.',
      });
    }

    // Get complaint updates/timeline
    const updates = await ComplaintUpdate.find({ complaint: complaint._id })
      .populate('updatedBy', 'name role')
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: {
        complaint,
        updates,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/complaints/:id/feedback
 * Submit feedback for a completed complaint
 */
const submitFeedback = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid complaint ID format.',
      });
    }

    const errors = validateFeedback(req.body);
    if (errors.length > 0) {
      return res.status(422).json({
        success: false,
        message: errors.join('. '),
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    // Only the complaint owner can submit feedback
    if (complaint.citizen.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only submit feedback for your own complaints.',
      });
    }

    // Must be completed
    if (complaint.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Feedback can only be submitted for completed complaints.',
      });
    }

    // Check if feedback already submitted
    if (complaint.feedback && complaint.feedback.submittedAt) {
      return res.status(409).json({
        success: false,
        message: 'Feedback has already been submitted for this complaint.',
      });
    }

    complaint.feedback = {
      rating: Number(req.body.rating),
      comment: req.body.comment ? req.body.comment.trim() : '',
      submittedAt: new Date(),
    };

    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Thank you for your feedback!',
      data: { complaint },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  submitFeedback,
};
