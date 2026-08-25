const express = require('express');
const { 
  applyOpportunity, 
  getStudentApplications, 
  getOpportunityApplicants, 
  updateApplicationStatus 
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Student-specific placement application routes
router.post('/', protect, authorize('student'), applyOpportunity);
router.get('/student', protect, authorize('student'), getStudentApplications);

// Company-specific candidate status review routes
router.get('/opportunity/:opportunityId', protect, authorize('company'), getOpportunityApplicants);
router.put('/:id/status', protect, authorize('company'), updateApplicationStatus);

module.exports = router;
