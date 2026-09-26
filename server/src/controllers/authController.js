const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateRegistration, validateLogin } = require('../utils/validators');

/**
 * Generate JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * Set token cookie
 */
const setTokenCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  res.cookie('token', token, cookieOptions);
};

/**
 * POST /api/auth/register
 * Register a new citizen
 */
const register = async (req, res, next) => {
  try {
    const errors = validateRegistration(req.body);
    if (errors.length > 0) {
      return res.status(422).json({
        success: false,
        message: errors.join('. '),
      });
    }

    const { name, email, phone, password, villageId, ward, role, location } = req.body;

    // Determine role and status
    const assignedRole = role === 'SARPANCH' ? 'SARPANCH' : 'CITIZEN';
    const sarpanchStatus = assignedRole === 'SARPANCH' ? 'PENDING' : 'NOT_APPLICABLE';

    // Check if email already exists
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Check if phone already exists
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: 'An account with this phone number already exists.',
      });
    }

    let dbVillageId = villageId;

    // Process cascading location payload if provided
    if (location && (location.villageName || location.villageId)) {
      const Village = require('../models/Village');
      const vName = location.villageName || 'Village';
      const dName = location.districtName || 'District';
      const sName = location.stateName || 'State';
      const code = location.lgdCode || location.villageId || `VIL-${Date.now()}`;

      let villageDoc = await Village.findOne({
        $or: [
          { villageCode: code },
          { name: vName, district: dName }
        ]
      });

      if (!villageDoc) {
        villageDoc = await Village.create({
          name: vName,
          district: dName,
          state: sName,
          pincode: '000000',
          villageCode: code,
          isActive: true,
        });
      }
      dbVillageId = villageDoc._id;
    }

    let user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password,
      role: assignedRole,
      sarpanchStatus,
      villageId: dbVillageId,
      location: location || {},
      ward: ward ? ward.trim() : '',
    });

    user = await user.populate('villageId', 'name district state villageCode');

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Welcome to NagrikConnect!',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Login user
 */
const login = async (req, res, next) => {
  try {
    const errors = validateLogin(req.body);
    if (errors.length > 0) {
      return res.status(422).json({
        success: false,
        message: errors.join('. '),
      });
    }

    const { email, password } = req.body;

    // Find user with password field included
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .populate('villageId', 'name district state villageCode');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated. Contact administration.',
      });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 * Logout user
 */
const logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

/**
 * GET /api/auth/me
 * Get current user
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('villageId', 'name district state villageCode');

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
};
