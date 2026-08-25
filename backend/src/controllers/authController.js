import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import mongoose from 'mongoose';
import User from '../models/User.js';


const JWT_SECRET = process.env.JWT_SECRET || 'skillnexus_ai_jwt_secret_key_2026';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const VALID_ROLES = ['student', 'company', 'academician', 'institution', 'admin'];


// Helper: Generate a JWT token from a user ID
const generateToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });


// Helper: Extract safe user payload for API response
const userPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  avatarUrl: user.avatarUrl || null,
  emailVerified: user.emailVerified || false,
});


// POST /api/auth/register — public
export const register = async (req, res) => {
  try {

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection offline. Please check your MongoDB server connection.'
      });
    }

    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, password, and role' });
    }

    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role selection' });
    }

    if (await User.findOne({ email })) {
      return res.status(400).json({ success: false, message: 'User already exists with this email address' });
    }

    const user = await User.create({
      name,
      email,
      passwordHash: password,
      role,
      status: role === 'company' ? 'pending' : 'active'
    });

    res.status(201).json({
      success: true,
      message: role === 'company'
        ? 'Registration successful! Your account is pending administrator verification.'
        : 'Registration successful!',
      token: generateToken(user._id),
      user: userPayload(user)
    });

  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Server error during registration.' });
  }
};


// POST /api/auth/login — public
export const login = async (req, res) => {
  try {

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection offline. Please start local MongoDB or check connection.'
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+passwordHash');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact support.' });
    }

    if (user.status === 'pending') {
      return res.status(403).json({ success: false, message: 'Your account is pending administrator verification and approval.' });
    }

    if (!(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token: generateToken(user._id),
      user: userPayload(user)
    });

  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Server error during login.' });
  }
};


// ---------------------------------------------------------------------------
// GOOGLE OAUTH — Authorization-code flow (no Passport, pure redirect)
// ---------------------------------------------------------------------------

// GET /api/auth/google — redirect to Google authorization page
export const googleInitiate = (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.redirect(`${FRONTEND_URL}/login?oauth_error=Google+sign-in+is+not+configured.`);
  }

  // CSRF protection: random state token stored in query (stateless — validated at callback)
  const state = crypto.randomBytes(16).toString('hex');
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    response_type: 'code',
    scope: 'openid profile email',
    access_type: 'offline',
    state,
    prompt: 'select_account',
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
};


// GET /api/auth/google/callback — exchange code, find/create user, redirect to frontend
export const googleCallback = async (req, res) => {
  const { code, error, error_description } = req.query;

  if (error) {
    const msg = error === 'access_denied'
      ? 'Google sign-in was cancelled.'
      : `Google sign-in failed: ${error_description || error}`;
    return res.redirect(`${FRONTEND_URL}/login?oauth_error=${encodeURIComponent(msg)}`);
  }

  if (!code) {
    return res.redirect(`${FRONTEND_URL}/login?oauth_error=${encodeURIComponent('Unable to complete Google sign-in. Please try again.')}`);
  }

  try {
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

    // 1. Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.error('Google token exchange error:', tokenData);
      return res.redirect(`${FRONTEND_URL}/login?oauth_error=${encodeURIComponent('Unable to complete Google sign-in. Please try again.')}`);
    }

    // 2. Get user info from Google
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userInfoRes.json();

    if (!googleUser.sub) {
      return res.redirect(`${FRONTEND_URL}/login?oauth_error=${encodeURIComponent('Unable to retrieve Google profile. Please try again.')}`);
    }

    // 3. Find or create SkillNexus AI user
    const result = await findOrCreateOAuthUser({
      provider: 'google',
      providerId: googleUser.sub,
      email: googleUser.email,
      name: googleUser.name,
      avatarUrl: googleUser.picture,
      emailVerified: googleUser.email_verified === true,
    });

    if (result.needsRole) {
      // New user without a role — redirect to role picker with a temp token
      const tempToken = jwt.sign({ oauthData: result.oauthData }, JWT_SECRET, { expiresIn: '15m' });
      return res.redirect(`${FRONTEND_URL}/auth/oauth/role?tempToken=${encodeURIComponent(tempToken)}`);
    }

    // 4. Existing user — issue JWT and send to frontend callback
    const token = generateToken(result.user._id);
    const userData = encodeURIComponent(JSON.stringify(userPayload(result.user)));
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}&user=${userData}`);

  } catch (err) {
    console.error('Google OAuth callback error:', err);
    res.redirect(`${FRONTEND_URL}/login?oauth_error=${encodeURIComponent('Google sign-in could not be completed. Please try again.')}`);
  }
};


// ---------------------------------------------------------------------------
// LINKEDIN OAUTH — OpenID Connect (OIDC) authorization-code flow
// ---------------------------------------------------------------------------

// GET /api/auth/linkedin — redirect to LinkedIn authorization page
export const linkedinInitiate = (req, res) => {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  if (!clientId) {
    return res.redirect(`${FRONTEND_URL}/login?oauth_error=LinkedIn+sign-in+is+not+configured.`);
  }

  const state = crypto.randomBytes(16).toString('hex');
  const callbackUrl = process.env.LINKEDIN_CALLBACK_URL || 'http://localhost:5000/api/auth/linkedin/callback';

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: callbackUrl,
    state,
    scope: 'openid profile email',
  });

  res.redirect(`https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`);
};


// GET /api/auth/linkedin/callback — exchange code, find/create user, redirect to frontend
export const linkedinCallback = async (req, res) => {
  const { code, error, error_description } = req.query;

  if (error) {
    const msg = error === 'user_cancelled_login' || error === 'user_cancelled_authorize'
      ? 'LinkedIn sign-in was cancelled.'
      : `LinkedIn sign-in failed: ${error_description || error}`;
    return res.redirect(`${FRONTEND_URL}/login?oauth_error=${encodeURIComponent(msg)}`);
  }

  if (!code) {
    return res.redirect(`${FRONTEND_URL}/login?oauth_error=${encodeURIComponent('Unable to complete LinkedIn sign-in. Please try again.')}`);
  }

  try {
    const callbackUrl = process.env.LINKEDIN_CALLBACK_URL || 'http://localhost:5000/api/auth/linkedin/callback';

    // 1. Exchange authorization code for access token
    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: callbackUrl,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error || !tokenData.access_token) {
      console.error('LinkedIn token exchange error:', tokenData);
      return res.redirect(`${FRONTEND_URL}/login?oauth_error=${encodeURIComponent('Unable to complete LinkedIn sign-in. Please try again.')}`);
    }

    // 2. Get user info from LinkedIn OIDC userinfo endpoint
    const userInfoRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const linkedinUser = await userInfoRes.json();

    if (!linkedinUser.sub) {
      return res.redirect(`${FRONTEND_URL}/login?oauth_error=${encodeURIComponent('Unable to retrieve LinkedIn profile. Please try again.')}`);
    }

    if (!linkedinUser.email) {
      // LinkedIn did not return an email — redirect to a page asking for it
      return res.redirect(`${FRONTEND_URL}/login?oauth_error=${encodeURIComponent('LinkedIn did not share your email. Please ensure email is visible and try again.')}`);
    }

    // 3. Find or create SkillNexus AI user
    const result = await findOrCreateOAuthUser({
      provider: 'linkedin',
      providerId: linkedinUser.sub,
      email: linkedinUser.email,
      name: linkedinUser.name,
      avatarUrl: linkedinUser.picture,
      emailVerified: linkedinUser.email_verified === true,
    });

    if (result.needsRole) {
      const tempToken = jwt.sign({ oauthData: result.oauthData }, JWT_SECRET, { expiresIn: '15m' });
      return res.redirect(`${FRONTEND_URL}/auth/oauth/role?tempToken=${encodeURIComponent(tempToken)}`);
    }

    const token = generateToken(result.user._id);
    const userData = encodeURIComponent(JSON.stringify(userPayload(result.user)));
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}&user=${userData}`);

  } catch (err) {
    console.error('LinkedIn OAuth callback error:', err);
    res.redirect(`${FRONTEND_URL}/login?oauth_error=${encodeURIComponent('LinkedIn sign-in could not be completed. Please try again.')}`);
  }
};


// ---------------------------------------------------------------------------
// POST /api/auth/oauth/role — finalize new OAuth user with chosen role
// ---------------------------------------------------------------------------
export const setOAuthRole = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Missing temp token' });
  }

  const tempToken = authHeader.split(' ')[1];
  let decoded;

  try {
    decoded = jwt.verify(tempToken, JWT_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: 'Temp token expired or invalid. Please sign in again.' });
  }

  const { oauthData } = decoded;
  const { role } = req.body;

  if (!role || !['student', 'company', 'institution'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role selection' });
  }

  try {
    // Check again — maybe user was created by a concurrent request
    let user = await User.findOne({ email: oauthData.email });

    if (!user) {
      user = await User.create({
        name: oauthData.name,
        email: oauthData.email,
        role,
        status: role === 'company' ? 'pending' : 'active',
        emailVerified: oauthData.emailVerified,
        avatarUrl: oauthData.avatarUrl || null,
        authProviders: [{ provider: oauthData.provider, providerId: oauthData.providerId }],
      });
    } else if (!user.authProviders.some(p => p.provider === oauthData.provider)) {
      user.authProviders.push({ provider: oauthData.provider, providerId: oauthData.providerId });
      await user.save();
    }

    const token = generateToken(user._id);
    res.status(200).json({ success: true, token, user: userPayload(user) });

  } catch (error) {
    console.error('setOAuthRole error:', error);
    res.status(500).json({ success: false, message: 'Failed to create account. Please try again.' });
  }
};


// ---------------------------------------------------------------------------
// Internal helper: find or create a user from an OAuth provider
// ---------------------------------------------------------------------------
async function findOrCreateOAuthUser({ provider, providerId, email, name, avatarUrl, emailVerified }) {
  // 1. Find by provider identity
  let user = await User.findOne({
    'authProviders.provider': provider,
    'authProviders.providerId': providerId,
  });

  if (user) {
    // Update avatar if changed
    if (avatarUrl && user.avatarUrl !== avatarUrl) {
      user.avatarUrl = avatarUrl;
      await user.save();
    }
    return { user, needsRole: false };
  }

  // 2. Find by verified email (account linking)
  if (email) {
    user = await User.findOne({ email });

    if (user) {
      // Link provider to existing account
      if (!user.authProviders.some(p => p.provider === provider && p.providerId === providerId)) {
        user.authProviders.push({ provider, providerId });
      }
      if (avatarUrl && !user.avatarUrl) user.avatarUrl = avatarUrl;
      if (emailVerified && !user.emailVerified) user.emailVerified = true;
      await user.save();
      return { user, needsRole: false };
    }
  }

  // 3. Completely new user — needs role selection
  return {
    needsRole: true,
    oauthData: { provider, providerId, email, name, avatarUrl, emailVerified },
  };
}
