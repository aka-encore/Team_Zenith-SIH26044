import express from 'express';
import { getAdminStats, updateUserStatus, updateUserRole } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';


const router = express.Router();

// All routes here require Admin role verified by backend
router.use(protect);
router.use(authorize('admin'));

// GET /api/admin/stats — Get platform statistics and user list
router.get('/stats', getAdminStats);

// PUT /api/admin/users/:id/status — Approve / Deactivate user
router.put('/users/:id/status', updateUserStatus);

// PUT /api/admin/users/:id/role — Change user role
router.put('/users/:id/role', updateUserRole);

export default router;
