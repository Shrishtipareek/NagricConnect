const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getAllVillages,
  createVillage,
  updateVillageStatus,
  getPendingSarpanchs,
  manageSarpanchStatus,
} = require('../controllers/superAdminController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { requireSuperAdmin } = require('../middleware/roleMiddleware');

router.use(authenticateUser);
router.use(requireSuperAdmin);

// Dashboard
router.get('/dashboard', getDashboard);

// Village Management
router.get('/villages', getAllVillages);
router.post('/villages', createVillage);
router.patch('/villages/:id', updateVillageStatus);

// Sarpanch Management
router.get('/sarpanch/pending', getPendingSarpanchs);
router.patch('/sarpanch/:id/manage', manageSarpanchStatus);

module.exports = router;
