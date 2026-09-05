import express from 'express';
import {
  getProfile, updateProfile, uploadLogo, getDashboardStats, getAllCompaniesAdmin, verifyCompanyAdmin,
  searchStudents, getCandidateProfile, shortlistStudent, rejectCandidate, getRecommendedCandidates, getShortlistedStudents, scheduleInterview,
  getCompanyInterviews, cancelInterview, getSkillInsights,
  getCompanyNotifications, markNotificationAsRead, markAllNotificationsAsRead
} from '../controllers/companyController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { uploadProfilePhoto } from '../middleware/uploadMiddleware.js';

const router = express.Router();
router.get('/profile', protect, authorize('company'), getProfile);
router.put('/profile', protect, authorize('company'), updateProfile);
router.post('/logo', protect, authorize('company'), uploadProfilePhoto.single('logo'), uploadLogo);
router.get('/dashboard-stats', protect, authorize('company'), getDashboardStats);
router.get('/recommended-candidates', protect, authorize('company'), getRecommendedCandidates);
router.get('/skill-insights', protect, authorize('company'), getSkillInsights);
router.get('/students', protect, authorize('company'), searchStudents);
router.get('/students/:studentId', protect, authorize('company'), getCandidateProfile);
router.post('/students/:studentId/shortlist', protect, authorize('company'), shortlistStudent);
router.post('/students/:studentId/reject', protect, authorize('company'), rejectCandidate);
router.get('/shortlisted', protect, authorize('company'), getShortlistedStudents);
router.get('/interviews', protect, authorize('company'), getCompanyInterviews);
router.put('/applications/:id/interview', protect, authorize('company'), scheduleInterview);
router.put('/applications/:id/interview/cancel', protect, authorize('company'), cancelInterview);
router.get('/notifications', protect, authorize('company'), getCompanyNotifications);
router.put('/notifications/:id/read', protect, authorize('company'), markNotificationAsRead);
router.put('/notifications/read-all', protect, authorize('company'), markAllNotificationsAsRead);
router.get('/admin/all', protect, authorize('admin'), getAllCompaniesAdmin);
router.put('/admin/:id/verify', protect, authorize('admin'), verifyCompanyAdmin);
export default router;


