const express = require('express');
const { getProfile, updateProfile } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected profile routes restricted to authenticated student users
router.get('/profile', protect, authorize('student'), getProfile);
router.put('/profile', protect, authorize('student'), updateProfile);

module.exports = router;
