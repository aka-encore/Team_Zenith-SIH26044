import express from 'express';
import {
  getProfile, updateProfile, getAllCompaniesAdmin, verifyCompanyAdmin
} from '../controllers/companyController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/profile', protect, authorize('company'), getProfile);
router.put('/profile', protect, authorize('company'), updateProfile);
router.get('/admin/all', protect, authorize('admin'), getAllCompaniesAdmin);
router.put('/admin/:id/verify', protect, authorize('admin'), verifyCompanyAdmin);
export default router;
