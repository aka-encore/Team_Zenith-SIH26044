const express = require('express');
const { 
  getProfile, 
  updateProfile,
  getAllCompaniesAdmin,
  verifyCompanyAdmin
} = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected profile routes restricted to authenticated company users
router.get('/profile', protect, authorize('company'), getProfile);
router.put('/profile', protect, authorize('company'), updateProfile);

// Admin-specific corporate moderation routes
router.get('/admin/all', protect, authorize('admin'), getAllCompaniesAdmin);
router.put('/admin/:id/verify', protect, authorize('admin'), verifyCompanyAdmin);

module.exports = router;
