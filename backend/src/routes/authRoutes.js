import express from 'express';
import {
  register,
  login,
  googleInitiate,
  googleCallback,
  linkedinInitiate,
  linkedinCallback,
  setOAuthRole,
} from '../controllers/authController.js';


const router = express.Router();


// ─── Email / Password ────────────────────────────────────────────────────────

// POST /api/auth/register — Create a new user account
router.post('/register', register);

// POST /api/auth/login — Authenticate and get JWT token
router.post('/login', login);


// ─── Google OAuth 2.0 ────────────────────────────────────────────────────────

// GET /api/auth/google — Initiate Google OAuth flow
router.get('/google', googleInitiate);

// GET /api/auth/google/callback — Google redirects here after authorization
router.get('/google/callback', googleCallback);


// ─── LinkedIn OIDC ───────────────────────────────────────────────────────────

// GET /api/auth/linkedin — Initiate LinkedIn OIDC flow
router.get('/linkedin', linkedinInitiate);

// GET /api/auth/linkedin/callback — LinkedIn redirects here after authorization
router.get('/linkedin/callback', linkedinCallback);


// ─── OAuth Role Selection ────────────────────────────────────────────────────

// POST /api/auth/oauth/role — Set role for a new OAuth user (uses temp JWT)
router.post('/oauth/role', setOAuthRole);


export default router;
