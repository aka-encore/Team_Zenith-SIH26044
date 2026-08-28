import express from 'express';
import {
  register,
  login,
  sendLoginOtp,
  verifyLoginOtp,
  sendRegisterOtp,
  verifyRegisterOtp,
  sendForgotPasswordOtp,
  resetPasswordWithOtp,
  changePassword,
  getUserProfile,
  updateUserProfile,
  firebaseGoogleAuth,
  googleInitiate,
  googleCallback,
  linkedinInitiate,
  linkedinCallback,
  setOAuthRole,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';


const router = express.Router();


// ─── Direct Authentication ───────────────────────────────────────────────────

// POST /api/auth/register — Direct register
router.post('/register', register);

// POST /api/auth/login — Direct password login
router.post('/login', login);


// ─── Email OTP Verification (SMTP: sih96880@gmail.com) ────────────────────────

// POST /api/auth/send-login-otp — Send 6-digit login code
router.post('/send-login-otp', sendLoginOtp);

// POST /api/auth/verify-login-otp — Verify OTP code and login
router.post('/verify-login-otp', verifyLoginOtp);

// POST /api/auth/send-register-otp — Send registration OTP
router.post('/send-register-otp', sendRegisterOtp);

// POST /api/auth/verify-register-otp — Verify OTP and create account
router.post('/verify-register-otp', verifyRegisterOtp);

// POST /api/auth/send-forgot-password-otp — Send password reset OTP
router.post('/send-forgot-password-otp', sendForgotPasswordOtp);

// POST /api/auth/reset-password-with-otp — Reset password with OTP
router.post('/reset-password-with-otp', resetPasswordWithOtp);


// ─── User Profile & Security (Protected) ──────────────────────────────────────

// GET /api/auth/profile — Fetch current user profile
router.get('/profile', protect, getUserProfile);

// PUT /api/auth/profile — Update user profile details
router.put('/profile', protect, updateUserProfile);

// POST /api/auth/change-password — Change password
router.post('/change-password', protect, changePassword);


// ─── Google OAuth & Firebase ──────────────────────────────────────────────────

// POST /api/auth/firebase-google — Firebase Google Authentication
router.post('/firebase-google', firebaseGoogleAuth);

// GET /api/auth/google — Initiate Google OAuth flow (fallback)
router.get('/google', googleInitiate);

// GET /api/auth/google/callback — Google OAuth callback
router.get('/google/callback', googleCallback);


// ─── LinkedIn OIDC ───────────────────────────────────────────────────────────

// GET /api/auth/linkedin — Initiate LinkedIn OIDC flow
router.get('/linkedin', linkedinInitiate);

// GET /api/auth/linkedin/callback — LinkedIn callback
router.get('/linkedin/callback', linkedinCallback);


// ─── OAuth Role Selection ────────────────────────────────────────────────────

// POST /api/auth/oauth/role — Set role for a new OAuth user
router.post('/oauth/role', setOAuthRole);


export default router;
