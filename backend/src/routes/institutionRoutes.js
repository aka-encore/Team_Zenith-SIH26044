const express = require('express');
const { getAnalytics } = require('../controllers/institutionController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Institutional analytics query routes
router.get('/analytics', protect, authorize('institution'), getAnalytics);

module.exports = router;
