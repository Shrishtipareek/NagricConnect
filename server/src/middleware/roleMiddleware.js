/**
 * Role-based authorization middleware
 * Must be used AFTER authenticateUser middleware
 */

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource.',
      });
    }

    if (req.user.role === 'SARPANCH' && req.user.sarpanchStatus !== 'APPROVED' && roles.includes('SARPANCH')) {
      return res.status(403).json({
        success: false,
        message: 'Your Sarpanch account is pending approval or has been rejected.',
      });
    }

    next();
  };
};

const requireCitizen = requireRole('CITIZEN', 'SARPANCH', 'SUPER_ADMIN');
const requireSarpanch = requireRole('SARPANCH');
const requireSuperAdmin = requireRole('SUPER_ADMIN');

module.exports = {
  requireRole,
  requireCitizen,
  requireSarpanch,
  requireSuperAdmin,
};
