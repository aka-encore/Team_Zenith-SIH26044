import express from 'express';
import {
  applyOpportunity, getStudentApplications, getOpportunityApplicants, getCompanyApplications, updateApplicationStatus,
  getStudentInterviews
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/', protect, authorize('student'), applyOpportunity);
router.get('/student', protect, authorize('student'), getStudentApplications);
router.get('/my-applications', protect, authorize('student'), getStudentApplications);
router.get('/student/interviews', protect, authorize('student'), getStudentInterviews);
router.get('/company/all', protect, authorize('company'), getCompanyApplications);
router.get('/opportunity/:opportunityId', protect, authorize('company'), getOpportunityApplicants);
router.put('/:id/status', protect, authorize('company'), updateApplicationStatus);
export default router;

