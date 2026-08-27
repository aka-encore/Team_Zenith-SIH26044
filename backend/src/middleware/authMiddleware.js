import jwt from 'jsonwebtoken';
import User from '../models/User.js';


const JWT_SECRET = process.env.JWT_SECRET || 'skillnexus_ai_jwt_secret_key_2026';


/**
 * Protect middleware: Verifies JWT token and attaches authenticated user
 */
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


/**
 * Authorize middleware: Strict role-based backend verification
 * Supports aliases (faculty / institution / academician)
 */
export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated, please sign in'
    });
  }

  const userRole = (req.user.role || '').toLowerCase();

  // Expand role aliases
  const allowed = roles.flatMap(r => {
    const roleLower = r.toLowerCase();
    if (roleLower === 'faculty' || roleLower === 'institution' || roleLower === 'academician') {
      return ['faculty', 'institution', 'academician'];
    }
    return [roleLower];
  });

  // Always allow admin or matching role
  if (userRole === 'admin' || allowed.includes(userRole)) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: `Role '${req.user.role}' is not authorized to access this resource`
  });
};
