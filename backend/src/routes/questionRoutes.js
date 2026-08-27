import express from 'express';
import {
  createQuestion,
  getAdminQuestions,
  updateQuestion,
  deleteQuestion,
  seedQuestions,
  getAvailableSkills,
  getStudentQuestions,
  submitStudentAssessment
} from '../controllers/questionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── Student & Shared Routes (Protected) ──
router.get('/skills', protect, getAvailableSkills);
router.get('/student', protect, getStudentQuestions);
router.post('/submit', protect, submitStudentAssessment);

// ── Admin-Only Routes (Protected & Authorized for 'admin') ──
router.post('/', protect, authorize('admin'), createQuestion);
router.get('/admin', protect, authorize('admin'), getAdminQuestions);
router.put('/:id', protect, authorize('admin'), updateQuestion);
router.delete('/:id', protect, authorize('admin'), deleteQuestion);
router.post('/seed', protect, authorize('admin'), seedQuestions);

export default router;
