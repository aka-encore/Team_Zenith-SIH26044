const jwt = require('jsonwebtoken');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'sih26044_jwt_secret_key_2026', {
    expiresIn: '30d' // Token valid for 30 days
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and role'
      });
    }

    // Validate role
    const validRoles = ['student', 'company', 'academician', 'institution', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role selection'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email address'
      });
    }

    // Determine status (Companies are registered as active or pending depending on administrative choices, let's default to active for general flow, but we can set company to pending if needed. The SRS says "Verify companies" by admin. So let's default status of companies to 'pending' and other roles to 'active')
    const status = role === 'company' ? 'pending' : 'active';

    // Create user (Pre-save hook in User model hashes the password)
    const user = await User.create({
      name,
      email,
      passwordHash: password, // Save raw password which will be hashed pre-save
      role,
      status
    });

    if (user) {
      // Auto-create empty profile for students
      if (role === 'student') {
        await StudentProfile.create({ userId: user._id });
      }
      
      // Create profile placeholders based on role if needed (we can do this in their respective controllers later)
      res.status(201).json({
        success: true,
        message: role === 'company' 
          ? 'Registration successful! Your account is pending administrator verification.' 
          : 'Registration successful!',
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid user data provided'
      });
    }
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again.'
    });
  }
};

// @desc    Authenticate user and get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user (explicitly select passwordHash)
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check status
    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // For companies, check if they are verified. 
    // In some systems they might log in but not see dashboards, or not log in at all. 
    // Let's allow login but provide messages.
    if (user.status === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending administrator verification and approval.'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again.'
    });
  }
};

module.exports = {
  register,
  login
};
