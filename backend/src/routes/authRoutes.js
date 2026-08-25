import express from 'express';
import { register, login } from '../controllers/authController.js';


const router = express.Router();


// POST /api/auth/register — Create a new user account
router.post('/register', register);


// POST /api/auth/login — Authenticate and get JWT token
router.post('/login', login);


export default router;
