const express = require('express');
const { 
  createOpportunity, 
  getOpportunities, 
  getCompanyOpportunities, 
  updateOpportunity, 
  deleteOpportunity 
} = require('../controllers/opportunityController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// General opportunity browsing (Open to student, company, academician roles)
router.get('/', protect, getOpportunities);

// Company-specific opportunity management routes
router.post('/', protect, authorize('company'), createOpportunity);
router.get('/company', protect, authorize('company'), getCompanyOpportunities);
router.put('/:id', protect, authorize('company'), updateOpportunity);
router.delete('/:id', protect, authorize('company'), deleteOpportunity);

module.exports = router;
