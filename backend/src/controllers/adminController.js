import User from '../models/User.js';
import Opportunity from '../models/Opportunity.js';


/**
 * GET /api/admin/stats — Get system overview metrics & users list
 * Protected: Admin only
 */
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const students = await User.countDocuments({ role: 'student' });
    const faculty = await User.countDocuments({ role: { $in: ['faculty', 'institution', 'academician'] } });
    const companies = await User.countDocuments({ role: 'company' });
    const admins = await User.countDocuments({ role: 'admin' });
    const pendingCompanies = await User.countDocuments({ role: 'company', status: 'pending' });

    let opportunities = 0;
    try {
      opportunities = await Opportunity.countDocuments();
    } catch {
      opportunities = 0;
    }

    const users = await User.find()
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        students,
        faculty,
        companies,
        admins,
        pendingCompanies,
        opportunities,
      },
      users,
    });
  } catch (error) {
    console.error('getAdminStats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


/**
 * PUT /api/admin/users/:id/status — Update user active/pending/inactive status
 * Protected: Admin only
 */
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = status;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      }
    });
  } catch (error) {
    console.error('updateUserStatus error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


/**
 * PUT /api/admin/users/:id/role — Change a user's role
 * Protected: Admin only
 */
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['student', 'faculty', 'company', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('updateUserRole error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
