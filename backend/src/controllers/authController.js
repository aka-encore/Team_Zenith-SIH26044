import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import mongoose from 'mongoose';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import Company from '../models/Company.js';
import Otp from '../models/Otp.js';
import { sendOtpEmail, generateOtp } from '../utils/emailService.js';


const JWT_SECRET = process.env.JWT_SECRET || 'skillnexus_ai_jwt_secret_key_2026';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const VALID_ROLES = ['student', 'faculty', 'company', 'admin', 'institution', 'academician'];


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
  phone: user.phone || '',
  department: user.department || '',
  designation: user.designation || '',
  institution: user.institution || '',
  employeeId: user.employeeId || '',
  officeLocation: user.officeLocation || '',
  bio: user.bio || '',
  preferences: user.preferences || {},
  createdAt: user.createdAt || null,
  authProviders: (user.authProviders || []).map(p => p.provider),
});


// ---------------------------------------------------------------------------
// POST /api/auth/register — direct registration
// ---------------------------------------------------------------------------
export const register = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection offline. Please check your MongoDB server connection.'
      });
    }

    const { 
      name, email, password, role,
      // Student specific
      rollNumber, college, department, yearOfStudy, phone,
      // Company specific
      companyName, hrName, industry, website, address,
      // Faculty specific
      employeeId, designation
    } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide email, password, and role' });
    }

    // Public registration is only allowed for student, company, faculty
    if (!['student', 'faculty', 'company', 'institution', 'academician'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role for public registration.' });
    }

    const resolvedName = (name || companyName || hrName || 'User').trim();
    if (!resolvedName) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const targetRole = role === 'institution' || role === 'academician' ? 'faculty' : role;

    if (await User.findOne({ email: email.toLowerCase(), role: targetRole })) {
      return res.status(400).json({ success: false, message: `An account already exists with this email for the ${targetRole} portal.` });
    }

    const user = await User.create({
      name: resolvedName,
      email: email.toLowerCase(),
      passwordHash: password,
      role: targetRole,
      status: role === 'company' ? 'pending' : 'active'
    });

    // Create or update required profile records based on role
    if (role === 'student') {
      await StudentProfile.findOneAndUpdate(
        { userId: user._id },
        {
          $set: {
            phone: phone || '',
            academicInformation: {
              rollNumber: rollNumber || '',
              college: college || 'University Campus',
              branch: department || 'Engineering',
              graduationYear: yearOfStudy || '2026',
              cgpa: 8.0
            },
            skills: ['Problem Solving', 'Data Structures', 'Web Development']
          }
        },
        { upsert: true, new: true }
      );
    } else if (role === 'company') {
      await Company.findOneAndUpdate(
        { userId: user._id },
        {
          $set: {
            companyName: companyName || resolvedName,
            industry: industry || 'Technology',
            location: address || 'Bengaluru, India',
            website: website || '',
            hrName: hrName || resolvedName,
            contactEmail: email.toLowerCase(),
            contactPhone: phone || '',
            verificationStatus: 'pending'
          }
        },
        { upsert: true, new: true }
      );
    }

    res.status(201).json({
      success: true,
      message: role === 'company'
        ? 'Registration successful! Your corporate account is pending administrator verification.'
        : 'Registration successful! You can now sign in with your credentials.',
      token: generateToken(user._id),
      user: userPayload(user)
    });

  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Server error during registration.' });
  }
};


// ---------------------------------------------------------------------------
// POST /api/auth/login — direct password login
// ---------------------------------------------------------------------------
export const login = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection offline. Please start local MongoDB or check connection.'
      });
    }

    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const query = { email: email.toLowerCase() };
    if (role) {
      query.role = role === 'institution' || role === 'academician' ? 'faculty' : role;
    }

    let user = await User.findOne(query).select('+passwordHash');
    if (!user && !role) {
      user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    }

    if (!user) {
      return res.status(401).json({ success: false, message: role ? `No ${role} account found with this email` : 'Invalid email or password' });
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
// OTP AUTHENTICATION (SMTP via sih96880@gmail.com)
// ---------------------------------------------------------------------------

// POST /api/auth/send-login-otp
export const sendLoginOtp = async (req, res) => {
  try {
    const { email, role, password } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide email address' });
    }

    const query = { email: email.toLowerCase() };
    if (role) {
      query.role = role === 'institution' || role === 'academician' ? 'faculty' : role;
    }

    let user = await User.findOne(query).select('+passwordHash');
    if (!user && !role) {
      user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: role ? `No ${role} account found with this email. Please register first.` : 'No account found with this email address.'
      });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    if (user.status === 'pending') {
      return res.status(403).json({ success: false, message: 'Account pending approval' });
    }

    // Verify password if provided
    if (password && !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const otp = generateOtp();
    await Otp.deleteMany({ email: email.toLowerCase(), purpose: 'login', role: user.role });
    await Otp.create({ email: email.toLowerCase(), otp, purpose: 'login', role: user.role });

    const emailResult = await sendOtpEmail(email.toLowerCase(), otp, 'login');

    res.status(200).json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${email}.`,
      email: email.toLowerCase(),
      role: user.role,
      emailDelivered: !!emailResult?.emailSent
    });
  } catch (error) {
    console.error('sendLoginOtp error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// POST /api/auth/verify-login-otp
export const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp, role } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and 6-digit OTP' });
    }

    const targetRole = role === 'institution' || role === 'academician' ? 'faculty' : role;
    const otpQuery = {
      email: email.toLowerCase(),
      otp: otp.toString().trim(),
      purpose: 'login'
    };
    if (targetRole) {
      otpQuery.role = targetRole;
    }

    let validOtp = await Otp.findOne(otpQuery);
    if (!validOtp && targetRole) {
      validOtp = await Otp.findOne({ email: email.toLowerCase(), otp: otp.toString().trim(), purpose: 'login' });
    }

    if (!validOtp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP verification code' });
    }

    const userQuery = { email: email.toLowerCase() };
    if (validOtp.role || targetRole) {
      userQuery.role = validOtp.role || targetRole;
    }

    const user = await User.findOne(userQuery);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    user.emailVerified = true;
    await user.save();

    await Otp.deleteMany({ email: email.toLowerCase(), purpose: 'login' });

    res.status(200).json({
      success: true,
      message: 'Login verified successfully!',
      token: generateToken(user._id),
      user: userPayload(user)
    });
  } catch (error) {
    console.error('verifyLoginOtp error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// POST /api/auth/send-register-otp
export const sendRegisterOtp = async (req, res) => {
  try {
    const { 
      name, email, password, role,
      rollNumber, college, department, yearOfStudy, phone,
      companyName, hrName, industry, website, address,
      employeeId, designation
    } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide email, password, and role' });
    }

    if (!['student', 'faculty', 'company', 'institution', 'academician'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role for public registration.' });
    }

    const targetRole = role === 'institution' || role === 'academician' ? 'faculty' : role;

    if (await User.findOne({ email: email.toLowerCase(), role: targetRole })) {
      return res.status(400).json({ success: false, message: `An account already exists with this email for the ${targetRole} portal.` });
    }

    const otp = generateOtp();
    await Otp.deleteMany({ email: email.toLowerCase(), purpose: 'register', role: targetRole });
    await Otp.create({
      email: email.toLowerCase(),
      otp,
      purpose: 'register',
      role: targetRole,
      userData: { 
        name: (name || companyName || hrName || 'User').trim(), 
        email: email.toLowerCase(), 
        password, 
        role: targetRole,
        rollNumber, college, department, yearOfStudy, phone,
        companyName, hrName, industry, website, address,
        employeeId, designation
      }
    });

    const emailResult = await sendOtpEmail(email.toLowerCase(), otp, 'register');

    res.status(200).json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${email}.`,
      email: email.toLowerCase(),
      emailDelivered: !!emailResult?.emailSent
    });
  } catch (error) {
    console.error('sendRegisterOtp error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// POST /api/auth/verify-register-otp
export const verifyRegisterOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and 6-digit OTP' });
    }

    const record = await Otp.findOne({
      email: email.toLowerCase(),
      otp: otp.toString().trim(),
      purpose: 'register'
    });

    if (!record || !record.userData) {
      return res.status(400).json({ success: false, message: 'Invalid or expired registration OTP code' });
    }

    const { 
      name, password, role,
      rollNumber, college, department, yearOfStudy, phone,
      companyName, hrName, industry, website, address,
      employeeId, designation
    } = record.userData;

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash: password,
      role,
      status: role === 'company' ? 'pending' : 'active',
      emailVerified: true
    });

    if (role === 'student') {
      await StudentProfile.findOneAndUpdate(
        { userId: user._id },
        {
          $set: {
            phone: phone || '',
            academicInformation: {
              rollNumber: rollNumber || '',
              college: college || 'University Campus',
              branch: department || 'Engineering',
              graduationYear: yearOfStudy || '2026',
              cgpa: 8.0
            },
            skills: ['Problem Solving', 'Data Structures', 'Web Development']
          }
        },
        { upsert: true, new: true }
      );
    } else if (role === 'company') {
      await Company.findOneAndUpdate(
        { userId: user._id },
        {
          $set: {
            companyName: companyName || name,
            industry: industry || 'Technology',
            location: address || 'Bengaluru, India',
            website: website || '',
            hrName: hrName || name,
            contactEmail: email.toLowerCase(),
            contactPhone: phone || '',
            verificationStatus: 'pending'
          }
        },
        { upsert: true, new: true }
      );
    }

    await Otp.deleteMany({ email: email.toLowerCase(), purpose: 'register' });

    res.status(201).json({
      success: true,
      message: role === 'company'
        ? 'Registration successful! Your corporate account is pending administrator verification.'
        : 'Account created and email verified successfully! You can now log in.',
      token: generateToken(user._id),
      user: userPayload(user)
    });
  } catch (error) {
    console.error('verifyRegisterOtp error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// POST /api/auth/send-forgot-password-otp
export const sendForgotPasswordOtp = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please enter a valid registered email address.' });
    }

    const query = { email: email.toLowerCase() };
    if (role) {
      query.role = role === 'institution' || role === 'academician' ? 'faculty' : role;
    }

    let user = await User.findOne(query);
    if (!user && !role) {
      user = await User.findOne({ email: email.toLowerCase() });
    }

    if (!user) {
      // Security: Do not reveal whether the email exists
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email address, a 6-digit verification code has been dispatched.',
        email: email.toLowerCase()
      });
    }

    const otp = generateOtp();
    await Otp.deleteMany({ email: email.toLowerCase(), purpose: 'forgot_password' });
    await Otp.create({ email: email.toLowerCase(), otp, purpose: 'forgot_password', role: user.role });

    const emailResult = await sendOtpEmail(email.toLowerCase(), otp, 'forgot_password');

    res.status(200).json({
      success: true,
      message: 'If an account exists with this email address, a 6-digit verification code has been dispatched.',
      email: email.toLowerCase(),
      emailDelivered: !!emailResult?.emailSent
    });
  } catch (error) {
    console.error('sendForgotPasswordOtp error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// POST /api/auth/reset-password-with-otp
export const resetPasswordWithOtp = async (req, res) => {
  try {
    const { email, otp, newPassword, role } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide email, verification code, and new password.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const validOtp = await Otp.findOne({
      email: email.toLowerCase(),
      otp: otp.toString().trim(),
      purpose: 'forgot_password'
    });

    if (!validOtp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code. Please check and retry.' });
    }

    const targetRole = (role && (role === 'institution' || role === 'academician' ? 'faculty' : role)) || validOtp.role;
    const userQuery = { email: email.toLowerCase() };
    if (targetRole) {
      userQuery.role = targetRole;
    }

    let user = await User.findOne(userQuery);
    if (!user) {
      user = await User.findOne({ email: email.toLowerCase() });
    }

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid request or user not found.' });
    }

    user.passwordHash = newPassword;
    await user.save();

    // Security: invalidate all reset OTPs for this email after successful verification
    await Otp.deleteMany({ email: email.toLowerCase(), purpose: 'forgot_password' });

    res.status(200).json({
      success: true,
      message: 'Password updated successfully! You can now sign in with your new credentials.'
    });
  } catch (error) {
    console.error('resetPasswordWithOtp error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// POST /api/auth/change-password
export const changePassword = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(userId).select('+passwordHash');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.passwordHash && currentPassword) {
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
    }

    user.passwordHash = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully!'
    });
  } catch (error) {
    console.error('changePassword error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// GET /api/auth/profile
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.query.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: userPayload(user)
    });
  } catch (error) {
    console.error('getUserProfile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// PUT /api/auth/profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.body.userId;
    const {
      name, avatarUrl, phone, institution, department,
      designation, employeeId, officeLocation, bio, preferences
    } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name && name.trim()) {
      user.name = name.trim();
    }

    if (avatarUrl !== undefined) {
      user.avatarUrl = avatarUrl;
    }

    if (phone !== undefined) {
      user.phone = phone.trim();
    }

    if (department !== undefined) {
      user.department = department.trim();
    }

    if (designation !== undefined) {
      user.designation = designation.trim();
    }

    if (institution !== undefined) {
      user.institution = institution.trim();
    }

    if (employeeId !== undefined) {
      user.employeeId = employeeId.trim();
    }

    if (officeLocation !== undefined) {
      user.officeLocation = officeLocation.trim();
    }

    if (bio !== undefined) {
      user.bio = bio.trim();
    }

    if (preferences !== undefined) {
      user.preferences = { ...(user.preferences || {}), ...preferences };
    }

    await user.save();

    // Also sync StudentProfile or Company if role is student or company
    if (user.role === 'student') {
      const studentUpdate = {};
      if (phone !== undefined) studentUpdate.phone = (phone || '').trim();
      if (bio !== undefined) studentUpdate.bio = (bio || '').trim();
      if (institution !== undefined) studentUpdate['academicInformation.college'] = (institution || '').trim();
      if (department !== undefined) studentUpdate['academicInformation.department'] = (department || '').trim();
      if (avatarUrl !== undefined) studentUpdate.profilePhoto = (avatarUrl || '').trim();
      if (Object.keys(studentUpdate).length > 0) {
        await StudentProfile.findOneAndUpdate({ userId }, { $set: studentUpdate }, { upsert: true });
      }
    } else if (user.role === 'company') {
      const companyUpdate = {};
      if (name && name.trim()) companyUpdate.companyName = name.trim();
      if (phone !== undefined) companyUpdate.contactPhone = (phone || '').trim();
      if (bio !== undefined) companyUpdate.description = (bio || '').trim();
      if (institution !== undefined) companyUpdate.location = (institution || '').trim();
      if (avatarUrl !== undefined) companyUpdate.logoUrl = (avatarUrl || '').trim();
      if (Object.keys(companyUpdate).length > 0) {
        await Company.findOneAndUpdate({ userId }, { $set: companyUpdate }, { upsert: true });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: userPayload(user)
    });
  } catch (error) {
    console.error('updateUserProfile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// ---------------------------------------------------------------------------
// POST /api/auth/upload-avatar — Multipart profile photo upload
// ---------------------------------------------------------------------------
export const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image file (JPG, PNG, WebP) under 5MB.'
      });
    }

    const avatarUrl = `/uploads/profiles/${req.file.filename}`;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.avatarUrl = avatarUrl;
    await user.save();

    // Also sync StudentProfile or Company if applicable
    if (user.role === 'student') {
      await StudentProfile.findOneAndUpdate({ userId }, { $set: { profilePhoto: avatarUrl } }, { upsert: true });
    } else if (user.role === 'company') {
      await Company.findOneAndUpdate({ userId }, { $set: { logoUrl: avatarUrl } }, { upsert: true });
    }

    res.status(200).json({
      success: true,
      message: 'Profile photo uploaded successfully!',
      avatarUrl,
      user: userPayload(user)
    });
  } catch (error) {
    console.error('uploadAvatar error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload profile photo.'
    });
  }
};


// ---------------------------------------------------------------------------
// GOOGLE OAUTH & FIREBASE
// ---------------------------------------------------------------------------

// POST /api/auth/firebase-google — Firebase Google Authentication
export const firebaseGoogleAuth = async (req, res) => {
  try {
    const { email, name, photoURL, uid, role } = req.body;

    if (!email || !uid) {
      return res.status(400).json({ success: false, message: 'Invalid Firebase authentication payload.' });
    }

    const result = await findOrCreateOAuthUser({
      provider: 'google',
      providerId: uid,
      email: email.toLowerCase(),
      name: name || email.split('@')[0],
      avatarUrl: photoURL || null,
      emailVerified: true,
    });

    if (result.needsRole) {
      if (role && VALID_ROLES.includes(role)) {
        const user = await User.create({
          name: name || email.split('@')[0],
          email: email.toLowerCase(),
          role,
          status: role === 'company' ? 'pending' : 'active',
          emailVerified: true,
          avatarUrl: photoURL || null,
          authProviders: [{ provider: 'google', providerId: uid }],
        });

        const token = generateToken(user._id);
        return res.status(200).json({
          success: true,
          message: 'Google login successful!',
          token,
          user: userPayload(user),
        });
      }

      const tempToken = jwt.sign({ oauthData: result.oauthData }, JWT_SECRET, { expiresIn: '15m' });
      return res.status(200).json({
        success: true,
        needsRole: true,
        tempToken,
      });
    }

    if (result.user.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated.' });
    }

    if (result.user.status === 'pending') {
      return res.status(403).json({ success: false, message: 'Your account is pending administrator verification.' });
    }

    const token = generateToken(result.user._id);
    return res.status(200).json({
      success: true,
      message: 'Google login successful!',
      token,
      user: userPayload(result.user),
    });

  } catch (error) {
    console.error('Firebase Google Auth error:', error);
    res.status(500).json({ success: false, message: error.message || 'Firebase Google authentication failed.' });
  }
};


// GET /api/auth/google — redirect to Google authorization page
export const googleInitiate = (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.redirect(`${FRONTEND_URL}/login?oauth_error=Google+sign-in+is+not+configured.`);
  }

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

    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userInfoRes.json();

    if (!googleUser.sub) {
      return res.redirect(`${FRONTEND_URL}/login?oauth_error=${encodeURIComponent('Unable to retrieve Google profile. Please try again.')}`);
    }

    const result = await findOrCreateOAuthUser({
      provider: 'google',
      providerId: googleUser.sub,
      email: googleUser.email,
      name: googleUser.name,
      avatarUrl: googleUser.picture,
      emailVerified: googleUser.email_verified === true,
    });

    if (result.needsRole) {
      const tempToken = jwt.sign({ oauthData: result.oauthData }, JWT_SECRET, { expiresIn: '15m' });
      return res.redirect(`${FRONTEND_URL}/auth/oauth/role?tempToken=${encodeURIComponent(tempToken)}`);
    }

    const token = generateToken(result.user._id);
    const userData = encodeURIComponent(JSON.stringify(userPayload(result.user)));
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}&user=${userData}`);

  } catch (err) {
    console.error('Google OAuth callback error:', err);
    res.redirect(`${FRONTEND_URL}/login?oauth_error=${encodeURIComponent('Google sign-in could not be completed. Please try again.')}`);
  }
};


// ---------------------------------------------------------------------------
// LINKEDIN OAUTH
// ---------------------------------------------------------------------------

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
    scope: 'openid profile email',
    state,
  });

  res.redirect(`https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`);
};


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

    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        redirect_uri: callbackUrl,
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.error('LinkedIn token exchange error:', tokenData);
      return res.redirect(`${FRONTEND_URL}/login?oauth_error=${encodeURIComponent('Unable to complete LinkedIn sign-in. Please try again.')}`);
    }

    const userInfoRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const linkedinUser = await userInfoRes.json();

    if (!linkedinUser.sub) {
      return res.redirect(`${FRONTEND_URL}/login?oauth_error=${encodeURIComponent('Unable to retrieve LinkedIn profile. Please try again.')}`);
    }

    if (!linkedinUser.email) {
      return res.redirect(`${FRONTEND_URL}/login?oauth_error=${encodeURIComponent('LinkedIn did not share your email. Please ensure email is visible and try again.')}`);
    }

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
    let user = await User.findOne({ email: oauthData.email.toLowerCase() });

    if (!user) {
      user = await User.create({
        name: oauthData.name,
        email: oauthData.email.toLowerCase(),
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
  let user = await User.findOne({
    'authProviders.provider': provider,
    'authProviders.providerId': providerId,
  });

  if (user) {
    if (avatarUrl && user.avatarUrl !== avatarUrl) {
      user.avatarUrl = avatarUrl;
      await user.save();
    }
    return { user, needsRole: false };
  }

  if (email) {
    user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      if (!user.authProviders.some(p => p.provider === provider && p.providerId === providerId)) {
        user.authProviders.push({ provider, providerId });
      }
      if (avatarUrl && !user.avatarUrl) user.avatarUrl = avatarUrl;
      if (emailVerified && !user.emailVerified) user.emailVerified = true;
      await user.save();
      return { user, needsRole: false };
    }
  }

  return {
    needsRole: true,
    oauthData: { provider, providerId, email: email.toLowerCase(), name, avatarUrl, emailVerified },
  };
}
