import express from 'express';
import { 
  getFacultyDashboardStats, getAnalytics, getFacultyStudents, 
  getFacultySkillsAnalytics, getFacultySkillGap, getFacultyOpportunities,
  getFacultyPlacement, getFacultyNotifications, markFacultyNotificationAsRead,
  markAllFacultyNotificationsAsRead
} from '../controllers/institutionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/dashboard-stats', protect, authorize('faculty', 'institution', 'admin'), getFacultyDashboardStats);
router.get('/analytics', protect, authorize('faculty', 'institution', 'admin'), getAnalytics);
router.get('/students', protect, authorize('faculty', 'institution', 'admin'), getFacultyStudents);
router.get('/skills-analytics', protect, authorize('faculty', 'institution', 'admin'), getFacultySkillsAnalytics);
router.get('/skill-gap', protect, authorize('faculty', 'institution', 'admin'), getFacultySkillGap);
router.get('/opportunities', protect, authorize('faculty', 'institution', 'admin'), getFacultyOpportunities);
router.get('/placement', protect, authorize('faculty', 'institution', 'admin'), getFacultyPlacement);
router.get('/notifications', protect, authorize('faculty', 'institution', 'admin'), getFacultyNotifications);
router.put('/notifications/:id/read', protect, authorize('faculty', 'institution', 'admin'), markFacultyNotificationAsRead);
router.put('/notifications/read-all', protect, authorize('faculty', 'institution', 'admin'), markAllFacultyNotificationsAsRead);
export default router;
