import express from 'express';
import { 
  getAdminStats, updateUserStatus, updateUserRole,
  getAdminUsers, getAdminUserById,
  getAdminCompanies, getAdminCompanyById, updateCompanyVerification,
  getAdminOpportunities, getAdminOpportunityById, updateAdminOpportunityStatus,
  getAdminApplications, getAdminApplicationById,
  getAdminPlacements,
  getAdminNotifications, markAdminNotificationAsRead, markAllAdminNotificationsAsRead
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';


const router = express.Router();

// All routes here require Admin role verified by backend
router.use(protect);
router.use(authorize('admin'));

// GET /api/admin/stats — Get platform statistics and user list
router.get('/stats', getAdminStats);

// Users Management
router.get('/users', getAdminUsers);
router.get('/users/:id', getAdminUserById);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/role', updateUserRole);

// Companies Management
router.get('/companies', getAdminCompanies);
router.get('/companies/:id', getAdminCompanyById);
router.put('/companies/:id/verification', updateCompanyVerification);

// Opportunities Management
router.get('/opportunities', getAdminOpportunities);
router.get('/opportunities/:id', getAdminOpportunityById);
router.put('/opportunities/:id/status', updateAdminOpportunityStatus);

// Applications Management
router.get('/applications', getAdminApplications);
router.get('/applications/:id', getAdminApplicationById);

// Placements Management
router.get('/placements', getAdminPlacements);

// Notifications Management
router.get('/notifications', getAdminNotifications);
router.put('/notifications/read-all', markAllAdminNotificationsAsRead);
router.put('/notifications/:id/read', markAdminNotificationAsRead);

export default router;
