import express from 'express';
import {
  createOpportunity, getOpportunities, getOpportunityMatch, getCompanyOpportunities, updateOpportunity, deleteOpportunity
} from '../controllers/opportunityController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/', protect, getOpportunities);
router.get('/:id/match', protect, getOpportunityMatch);
router.post('/', protect, authorize('company', 'faculty', 'institution', 'admin'), createOpportunity);
router.get('/company', protect, authorize('company'), getCompanyOpportunities);
router.put('/:id', protect, authorize('company'), updateOpportunity);
router.delete('/:id', protect, authorize('company'), deleteOpportunity);
export default router;
