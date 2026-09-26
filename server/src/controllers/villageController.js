const Village = require('../models/Village');
const User = require('../models/User');

/**
 * GET /api/villages
 * Get all active villages (public route for registration)
 */
const getActiveVillages = async (req, res, next) => {
  try {
    const villages = await Village.find({ isActive: true })
      .select('name district state villageCode')
      .sort({ name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: { villages },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActiveVillages,
};
