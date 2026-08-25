import express from 'express';
import { getProfile, updateProfile } from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/profile', protect, authorize('student'), getProfile);
router.put('/profile', protect, authorize('student'), updateProfile);
export default router;
