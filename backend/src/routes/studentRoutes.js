import express from 'express';
import {
  getProfile, updateProfile, uploadPhoto,
  getSkills, addSkill, editSkill, deleteSkill,
  getProjects, addProject, editProject, deleteProject,
  getCertifications, addCertification, editCertification, deleteCertification,
  getResume, uploadResume, deleteResume,
  getSkillGapAnalysis,
  getCareerReadinessScore,
  getSkillPassport,
  getDsaPracticeProblems,
  submitDsaProblem,
  getStudentNotifications, markStudentNotificationAsRead, markAllStudentNotificationsAsRead
} from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { uploadProfilePhoto, uploadResumePDF } from '../middleware/uploadMiddleware.js';


const router = express.Router();

// 1. Profile CRUD & Photo Upload
router.get('/profile', protect, authorize('student'), getProfile);
router.put('/profile', protect, authorize('student'), updateProfile);
router.post('/upload-photo', protect, authorize('student'), uploadProfilePhoto.single('photo'), uploadPhoto);

// 2. Skill Passport, Career Readiness & DSA Coding Practice
router.get('/skill-passport', protect, authorize('student', 'faculty', 'institution', 'company', 'admin'), getSkillPassport);
router.get('/readiness-score', protect, authorize('student'), getCareerReadinessScore);
router.get('/dsa-problems', protect, authorize('student'), getDsaPracticeProblems);
router.post('/dsa-submit', protect, authorize('student'), submitDsaProblem);

// 3. Skills CRUD
router.get('/skills', protect, authorize('student'), getSkills);
router.post('/skills', protect, authorize('student'), addSkill);
router.put('/skills/:skillId', protect, authorize('student'), editSkill);
router.delete('/skills/:skillId', protect, authorize('student'), deleteSkill);

// 4. Skill Gap Analysis (Skill Matching Engine)
router.get('/skill-gap', protect, authorize('student'), getSkillGapAnalysis);
router.post('/skill-gap', protect, authorize('student'), getSkillGapAnalysis);

// 5. Notifications
router.get('/notifications', protect, authorize('student'), getStudentNotifications);
router.put('/notifications/:id/read', protect, authorize('student'), markStudentNotificationAsRead);
router.put('/notifications/read-all', protect, authorize('student'), markAllStudentNotificationsAsRead);

// 5. Projects CRUD
router.get('/projects', protect, authorize('student'), getProjects);
router.post('/projects', protect, authorize('student'), addProject);
router.put('/projects/:projectId', protect, authorize('student'), editProject);
router.delete('/projects/:projectId', protect, authorize('student'), deleteProject);

// 6. Certifications CRUD
router.get('/certifications', protect, authorize('student'), getCertifications);
router.post('/certifications', protect, authorize('student'), addCertification);
router.put('/certifications/:certId', protect, authorize('student'), editCertification);
router.delete('/certifications/:certId', protect, authorize('student'), deleteCertification);

// 7. Resume Module (PDF upload, view, replace, delete)
router.get('/resume', protect, authorize('student'), getResume);
router.post('/upload-resume', protect, authorize('student'), uploadResumePDF.single('resume'), uploadResume);
router.delete('/resume', protect, authorize('student'), deleteResume);

export default router;
