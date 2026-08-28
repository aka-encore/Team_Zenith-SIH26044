import express from 'express';
import {
  getCatalog,
  getQuestions,
  submitAssessment,
  getHistory
} from '../controllers/assessmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All assessment routes are authenticated
router.use(protect);

router.get('/catalog', getCatalog);
router.get('/questions', getQuestions);
router.post('/submit', authorize('student', 'admin'), submitAssessment);
router.get('/history', getHistory);

export default router;
