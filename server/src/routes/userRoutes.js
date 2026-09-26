const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require('../controllers/userController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { uploadSingleImage } = require('../middleware/uploadMiddleware');

// All user routes require authentication
router.use(authenticateUser);

// Profile
router.get('/profile', getProfile);
router.patch('/profile', uploadSingleImage, updateProfile);

// Notifications
router.get('/notifications', getNotifications);
router.patch('/notifications/read-all', markAllNotificationsRead);
router.patch('/notifications/:id/read', markNotificationRead);

module.exports = router;
