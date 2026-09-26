const Village = require('../models/Village');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const { isValidObjectId } = require('../utils/validators');

/**
 * GET /api/super-admin/dashboard
 * Super Admin dashboard stats
 */
const getDashboard = async (req, res, next) => {
  try {
    const totalVillages = await Village.countDocuments();
    const activeVillages = await Village.countDocuments({ isActive: true });
    const totalCitizens = await User.countDocuments({ role: 'CITIZEN' });
    const totalSarpanch = await User.countDocuments({ role: 'SARPANCH' });
    const pendingSarpanch = await User.countDocuments({ role: 'SARPANCH', sarpanchStatus: 'PENDING' });
    const totalComplaints = await Complaint.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalVillages,
        activeVillages,
        totalCitizens,
        totalSarpanch,
        pendingSarpanch,
        totalComplaints,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/super-admin/villages
 * Get all villages with stats
 */
const getAllVillages = async (req, res, next) => {
  try {
    const villages = await Village.find().sort({ createdAt: -1 }).lean();

    const villagesWithStats = await Promise.all(
      villages.map(async (v) => {
        const citizensCount = await User.countDocuments({ villageId: v._id, role: 'CITIZEN' });
        const sarpanchsCount = await User.countDocuments({ villageId: v._id, role: 'SARPANCH' });
        const complaintsCount = await Complaint.countDocuments({ villageId: v._id });
        return { ...v, citizensCount, sarpanchsCount, complaintsCount };
      })
    );

    res.status(200).json({
      success: true,
      data: { villages: villagesWithStats },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/super-admin/villages
 * Create a new village
 */
const createVillage = async (req, res, next) => {
  try {
    const { name, district, state, pincode, villageCode, isActive } = req.body;

    const existingCode = await Village.findOne({ villageCode });
    if (existingCode) {
      return res.status(409).json({
        success: false,
        message: 'Village with this code already exists.',
      });
    }

    const village = await Village.create({
      name: name.trim(),
      district: district.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      villageCode: villageCode.trim(),
      isActive: isActive !== false,
    });

    res.status(201).json({
      success: true,
      message: 'Village created successfully.',
      data: { village },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/super-admin/villages/:id
 * Edit village status
 */
const updateVillageStatus = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid village ID.' });
    }

    const village = await Village.findById(req.params.id);
    if (!village) {
      return res.status(404).json({ success: false, message: 'Village not found.' });
    }

    if (typeof req.body.isActive === 'boolean') {
      village.isActive = req.body.isActive;
    }

    await village.save();

    res.status(200).json({
      success: true,
      message: `Village ${village.isActive ? 'activated' : 'deactivated'} successfully.`,
      data: { village },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/super-admin/sarpanch/pending
 * Get all pending Sarpanch approvals
 */
const getPendingSarpanchs = async (req, res, next) => {
  try {
    const pending = await User.find({ role: 'SARPANCH', sarpanchStatus: 'PENDING' })
      .populate('villageId', 'name district state villageCode')
      .select('-password')
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: { sarpanchs: pending },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/super-admin/sarpanch/:id/approve
 * Approve or Reject Sarpanch
 */
const manageSarpanchStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // 'APPROVED' or 'REJECTED'

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID.' });
    }

    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'SARPANCH') {
      return res.status(404).json({ success: false, message: 'Sarpanch user not found.' });
    }

    if (status === 'APPROVED') {
      // Check if village already has an active Sarpanch
      const existingActive = await User.findOne({
        role: 'SARPANCH',
        sarpanchStatus: 'APPROVED',
        villageId: user.villageId,
        _id: { $ne: user._id }
      });

      if (existingActive) {
        return res.status(409).json({
          success: false,
          message: 'This village already has an active Sarpanch.',
        });
      }
    }

    user.sarpanchStatus = status;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Sarpanch account ${status.toLowerCase()} successfully.`,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getAllVillages,
  createVillage,
  updateVillageStatus,
  getPendingSarpanchs,
  manageSarpanchStatus,
};
