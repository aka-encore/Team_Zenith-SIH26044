import express from 'express';
import {
  getProfile, updateProfile, uploadPhoto,
  getSkills, addSkill, editSkill, deleteSkill,
  getProjects, addProject, editProject, deleteProject,
  getCertifications, addCertification, editCertification, deleteCertification,
  getResume, uploadResume, deleteResume
} from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { uploadProfilePhoto, uploadResumePDF } from '../middleware/uploadMiddleware.js';


const router = express.Router();

// 1. Profile CRUD & Photo Upload
router.get('/profile', protect, authorize('student'), getProfile);
router.put('/profile', protect, authorize('student'), updateProfile);
router.post('/upload-photo', protect, authorize('student'), uploadProfilePhoto.single('photo'), uploadPhoto);

// 2. Skills CRUD
router.get('/skills', protect, authorize('student'), getSkills);
router.post('/skills', protect, authorize('student'), addSkill);
router.put('/skills/:skillId', protect, authorize('student'), editSkill);
router.delete('/skills/:skillId', protect, authorize('student'), deleteSkill);

// 3. Projects CRUD
router.get('/projects', protect, authorize('student'), getProjects);
router.post('/projects', protect, authorize('student'), addProject);
router.put('/projects/:projectId', protect, authorize('student'), editProject);
router.delete('/projects/:projectId', protect, authorize('student'), deleteProject);

// 4. Certifications CRUD
router.get('/certifications', protect, authorize('student'), getCertifications);
router.post('/certifications', protect, authorize('student'), addCertification);
router.put('/certifications/:certId', protect, authorize('student'), editCertification);
router.delete('/certifications/:certId', protect, authorize('student'), deleteCertification);

// 5. Resume Module (PDF upload, view, replace, delete)
router.get('/resume', protect, authorize('student'), getResume);
router.post('/upload-resume', protect, authorize('student'), uploadResumePDF.single('resume'), uploadResume);
router.delete('/resume', protect, authorize('student'), deleteResume);

export default router;
