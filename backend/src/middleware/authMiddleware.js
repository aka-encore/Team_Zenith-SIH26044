import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'skillnexus_ai_jwt_secret_key_2026';

export const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-passwordHash');

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
    }
    if (req.user.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Role (${req.user ? req.user.role : 'guest'}) is not authorized to access this route`
    });
  }
  next();
};
