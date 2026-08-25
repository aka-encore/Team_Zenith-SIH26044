import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';


const JWT_SECRET = process.env.JWT_SECRET || 'sih26044_jwt_secret_key_2026';

const VALID_ROLES = ['student', 'company', 'academician', 'institution', 'admin'];


// Helper: Generate a JWT token from a user ID
const generateToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });


// Helper: Extract safe user payload for API response
const userPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status
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
