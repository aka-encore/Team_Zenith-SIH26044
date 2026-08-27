import express from 'express';
import { getAnalytics } from '../controllers/institutionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/analytics', protect, authorize('faculty', 'institution'), getAnalytics);
export default router;
