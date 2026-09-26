const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  submitFeedback,
} = require('../controllers/complaintController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { requireCitizen } = require('../middleware/roleMiddleware');
const { uploadComplaintImages } = require('../middleware/uploadMiddleware');

// All complaint routes require authentication
router.use(authenticateUser);
router.use(requireCitizen);

router.post('/', uploadComplaintImages, createComplaint);
router.get('/my', getMyComplaints);
router.get('/:id', getComplaintById);
router.post('/:id/feedback', submitFeedback);

module.exports = router;
