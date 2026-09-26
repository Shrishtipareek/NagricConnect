const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { requireSarpanch } = require('../middleware/roleMiddleware');
const { uploadComplaintImages } = require('../middleware/uploadMiddleware');

// All admin routes require authentication + SARPANCH role
router.use(authenticateUser);
router.use(requireSarpanch);

// Dashboard
router.get('/dashboard', getDashboard);

// Complaint management
router.get('/complaints', getAllComplaints);
router.get('/complaints/:id', getComplaintDetail);
router.patch('/complaints/:id/status', uploadComplaintImages, updateComplaintStatus);
router.post('/complaints/:id/updates', uploadComplaintImages, addComplaintUpdate);

// User management
router.get('/users', getAllUsers);

// Notice management
router.get('/notices', getAdminNotices);
router.post('/notices', createNotice);
router.patch('/notices/:id', updateNotice);
router.delete('/notices/:id', deleteNotice);

// Analytics
router.get('/analytics', getAnalytics);

module.exports = router;
