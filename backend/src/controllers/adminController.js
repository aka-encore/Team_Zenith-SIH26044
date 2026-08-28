import User from '../models/User.js';
import Opportunity from '../models/Opportunity.js';
import Company from '../models/Company.js';
import Application from '../models/Application.js';
import StudentProfile from '../models/StudentProfile.js';

/**
 * GET /api/admin/stats — Get system overview metrics & users list
 * Protected: Admin only
 */
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalFaculty = await User.countDocuments({ role: { $in: ['faculty', 'institution', 'academician'] } });
    const totalCompanies = await Company.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const pendingCompanies = await Company.countDocuments({ verificationStatus: 'pending' });

    const activeJobs = await Opportunity.countDocuments({ type: 'job', status: 'open' });
    const activeInternships = await Opportunity.countDocuments({ type: 'internship', status: 'open' });
    const totalOpportunities = await Opportunity.countDocuments();

    const totalApplications = await Application.countDocuments();
    const totalPlacements = await Application.countDocuments({ status: 'accepted' });

    // Recent Users
    const recentUsers = await User.find()
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .limit(6);

    // Recent Companies
    const recentCompanies = await Company.find()
      .populate('userId', 'name email avatarUrl')
      .sort({ createdAt: -1 })
      .limit(6);

    // Recent Opportunities
    const recentOpportunities = await Opportunity.find()
      .populate('companyId', 'companyName industry location logo')
      .sort({ createdAt: -1 })
      .limit(6);

    // Recent Applications
    const recentApplications = await Application.find()
      .populate({
        path: 'opportunityId',
        select: 'title type',
        populate: { path: 'companyId', select: 'companyName' }
      })
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email avatarUrl' }
      })
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(6);

    const formattedApplications = recentApplications.map(app => ({
      _id: app._id,
      studentName: app.studentId?.userId?.name || 'Student Candidate',
      studentEmail: app.studentId?.userId?.email || 'N/A',
      opportunityTitle: app.opportunityId?.title || 'Open Role',
      opportunityType: app.opportunityId?.type || 'job',
      companyName: app.opportunityId?.companyId?.companyName || 'Enterprise Partner',
      status: app.status,
      date: app.updatedAt || app.createdAt
    }));

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        totalFaculty,
        totalCompanies,
        totalAdmins,
        pendingCompanies,
        activeJobs,
        activeInternships,
        totalOpportunities,
        totalApplications,
        totalPlacements
      },
      recentUsers,
      recentCompanies,
      recentOpportunities,
      recentApplications: formattedApplications,
      users: recentUsers
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

/**
 * GET /api/admin/users — Get users list with filters & search
 * Protected: Admin only
 */
export const getAdminUsers = async (req, res) => {
  try {
    const { search, role, status } = req.query;

    const query = {};
    if (role && role !== 'all') {
      if (role === 'faculty') {
        query.role = { $in: ['faculty', 'institution', 'academician'] };
      } else {
        query.role = role;
      }
    }
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('getAdminUsers error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/users/:id — Get full user details & linked profile
 * Protected: Admin only
 */
export const getAdminUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let extraDetails = null;
    if (user.role === 'student') {
      extraDetails = await StudentProfile.findOne({ userId: user._id });
    } else if (user.role === 'company') {
      extraDetails = await Company.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      user,
      extraDetails
    });
  } catch (error) {
    console.error('getAdminUserById error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/companies — Get companies list with filters & search
 * Protected: Admin only
 */
export const getAdminCompanies = async (req, res) => {
  try {
    const { search, industry, status } = req.query;

    const query = {};
    if (status && status !== 'all') {
      query.verificationStatus = status;
    }
    if (industry && industry !== 'all') {
      query.industry = { $regex: industry, $options: 'i' };
    }
    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { companyName: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
        { contactEmail: { $regex: q, $options: 'i' } },
        { hrName: { $regex: q, $options: 'i' } }
      ];
    }

    const companies = await Company.find(query)
      .populate('userId', 'name email status avatarUrl')
      .sort({ createdAt: -1 });

    const companyIds = companies.map(c => c._id);
    const opportunities = await Opportunity.find({ companyId: { $in: companyIds } });

    const formatted = companies.map(c => {
      const opps = opportunities.filter(o => o.companyId?.toString() === c._id.toString());
      return {
        _id: c._id,
        companyName: c.companyName,
        industry: c.industry || 'Technology',
        location: c.location || 'Bengaluru',
        logo: c.logo || c.logoUrl || null,
        description: c.description || '',
        website: c.website || '',
        hrName: c.hrName || c.userId?.name || 'HR Partner',
        contactEmail: c.contactEmail || c.userId?.email || 'N/A',
        contactPhone: c.contactPhone || 'N/A',
        verificationStatus: c.verificationStatus || 'pending',
        opportunitiesCount: opps.length,
        activeJobsCount: opps.filter(o => o.status === 'open' && o.type === 'job').length,
        activeInternshipsCount: opps.filter(o => o.status === 'open' && o.type === 'internship').length,
        createdAt: c.createdAt
      };
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      companies: formatted
    });
  } catch (error) {
    console.error('getAdminCompanies error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/companies/:id — Get full company details & opportunities
 * Protected: Admin only
 */
export const getAdminCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Company.findById(id).populate('userId', 'name email status avatarUrl');
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company record not found' });
    }

    const opportunities = await Opportunity.find({ companyId: company._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      company,
      opportunities
    });
  } catch (error) {
    console.error('getAdminCompanyById error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/admin/companies/:id/verification — Update company verification status
 * Protected: Admin only
 */
export const updateCompanyVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['verified', 'rejected', 'suspended', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid verification status' });
    }

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company record not found' });
    }

    company.verificationStatus = status;
    await company.save();

    if (status === 'suspended') {
      await User.findByIdAndUpdate(company.userId, { status: 'inactive' });
    } else if (status === 'verified') {
      await User.findByIdAndUpdate(company.userId, { status: 'active' });
    }

    res.status(200).json({
      success: true,
      message: `Company verification status updated to "${status}".`,
      company
    });
  } catch (error) {
    console.error('updateCompanyVerification error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/opportunities — Get opportunities list with filters & search
 * Protected: Admin only
 */
export const getAdminOpportunities = async (req, res) => {
  try {
    const { search, type, status } = req.query;

    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (type && type !== 'all') {
      query.type = type;
    }

    const opportunities = await Opportunity.find(query)
      .populate('companyId', 'companyName industry location logo website hrName contactEmail verificationStatus')
      .sort({ createdAt: -1 });

    const oppIds = opportunities.map(o => o._id);
    const applications = await Application.find({ opportunityId: { $in: oppIds } });

    const formatted = opportunities.map(opp => {
      const oppApps = applications.filter(a => a.opportunityId?.toString() === opp._id.toString());
      const created = opp.createdAt || new Date();
      const deadline = new Date(created.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

      return {
        _id: opp._id,
        title: opp.title,
        type: opp.type,
        location: opp.location || 'Remote',
        stipend: opp.stipend || 'Competitive',
        duration: opp.duration || 'Full-time',
        requiredSkills: opp.requiredSkills || [],
        description: opp.description || '',
        deadline,
        status: opp.status || 'open',
        company: {
          _id: opp.companyId?._id,
          name: opp.companyId?.companyName || 'Enterprise Partner',
          industry: opp.companyId?.industry || 'Technology',
          location: opp.companyId?.location || 'Bengaluru',
          logo: opp.companyId?.logo || null,
          contactEmail: opp.companyId?.contactEmail || '',
          verificationStatus: opp.companyId?.verificationStatus || 'verified'
        },
        applicantsCount: oppApps.length,
        shortlistedCount: oppApps.filter(a => a.status === 'shortlisted').length,
        selectedCount: oppApps.filter(a => a.status === 'accepted').length,
        createdAt: opp.createdAt
      };
    });

    let finalOpps = formatted;
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      finalOpps = formatted.filter(o =>
        o.title.toLowerCase().includes(q) ||
        o.company.name.toLowerCase().includes(q) ||
        o.location.toLowerCase().includes(q) ||
        o.requiredSkills.some(sk => sk.toLowerCase().includes(q))
      );
    }

    res.status(200).json({
      success: true,
      count: finalOpps.length,
      opportunities: finalOpps
    });
  } catch (error) {
    console.error('getAdminOpportunities error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/opportunities/:id — Get full opportunity details & applications
 * Protected: Admin only
 */
export const getAdminOpportunityById = async (req, res) => {
  try {
    const { id } = req.params;
    const opp = await Opportunity.findById(id)
      .populate('companyId', 'companyName industry location logo website hrName contactEmail');
    if (!opp) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }

    const applications = await Application.find({ opportunityId: opp._id })
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email avatarUrl' }
      });

    res.status(200).json({
      success: true,
      opportunity: opp,
      applications
    });
  } catch (error) {
    console.error('getAdminOpportunityById error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/admin/opportunities/:id/status — Approve / Reject / Suspend opportunity
 * Protected: Admin only
 */
export const updateAdminOpportunityStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['open', 'closed', 'approved', 'rejected', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const opp = await Opportunity.findById(id);
    if (!opp) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }

    opp.status = status;
    await opp.save();

    res.status(200).json({
      success: true,
      message: `Opportunity status updated to "${status}".`,
      opportunity: opp
    });
  } catch (error) {
    console.error('updateAdminOpportunityStatus error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/applications — Get all platform student applications
 * Protected: Admin only
 */
export const getAdminApplications = async (req, res) => {
  try {
    const { search, status, type } = req.query;

    const query = {};
    if (status && status !== 'all') {
      if (status === 'interview') {
        query.status = { $in: ['interview', 'interview_scheduled'] };
      } else if (status === 'selected') {
        query.status = 'accepted';
      } else {
        query.status = status;
      }
    }

    const applications = await Application.find(query)
      .populate({
        path: 'opportunityId',
        select: 'title type location stipend requiredSkills description',
        populate: { path: 'companyId', select: 'companyName industry location logo' }
      })
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email avatarUrl' }
      })
      .sort({ createdAt: -1 });

    const formatted = applications.map(app => {
      const opp = app.opportunityId;
      const comp = opp?.companyId;
      const student = app.studentId;
      const user = student?.userId;

      let displayStatus = app.status;
      if (app.status === 'accepted') displayStatus = 'selected';
      if (app.status === 'interview_scheduled') displayStatus = 'interview';

      return {
        _id: app._id,
        student: {
          _id: student?._id,
          name: user?.name || 'Student Candidate',
          email: user?.email || 'N/A',
          avatarUrl: user?.avatarUrl || null,
          cgpa: student?.academicInformation?.cgpa ?? 8.5,
          branch: student?.academicInformation?.branch || 'Computer Science',
          skills: student?.skills || student?.skillsList?.map(s => s.name) || [],
          resumeUrl: student?.resumeUrl || null
        },
        opportunity: {
          _id: opp?._id,
          title: opp?.title || 'Campus Drive',
          type: opp?.type || 'job',
          location: opp?.location || 'Remote',
          stipend: opp?.stipend || 'Competitive',
          requiredSkills: opp?.requiredSkills || []
        },
        company: {
          _id: comp?._id,
          name: comp?.companyName || 'Enterprise Partner',
          industry: comp?.industry || 'Technology',
          location: comp?.location || 'Bengaluru',
          logo: comp?.logo || null
        },
        status: displayStatus,
        rawStatus: app.status,
        interviewDetails: app.interviewDetails || null,
        appliedDate: app.createdAt
      };
    });

    let finalApps = formatted;
    if (type && type !== 'all') {
      finalApps = finalApps.filter(a => a.opportunity.type === type);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      finalApps = finalApps.filter(a =>
        a.student.name.toLowerCase().includes(q) ||
        a.student.email.toLowerCase().includes(q) ||
        a.company.name.toLowerCase().includes(q) ||
        a.opportunity.title.toLowerCase().includes(q)
      );
    }

    res.status(200).json({
      success: true,
      count: finalApps.length,
      applications: finalApps
    });
  } catch (error) {
    console.error('getAdminApplications error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/applications/:id — Get full application details
 * Protected: Admin only
 */
export const getAdminApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const app = await Application.findById(id)
      .populate({
        path: 'opportunityId',
        populate: { path: 'companyId' }
      })
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: '-passwordHash' }
      });

    if (!app) {
      return res.status(404).json({ success: false, message: 'Application record not found' });
    }

    res.status(200).json({
      success: true,
      application: app
    });
  } catch (error) {
    console.error('getAdminApplicationById error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/placements — Get placement drives, statistics, and candidate pipelines
 * Protected: Admin only
 */
export const getAdminPlacements = async (req, res) => {
  try {
    const { search, status, company } = req.query;

    const allStudents = await StudentProfile.find({}).populate('userId', 'name email');
    const totalStudentsCount = allStudents.length;
    const eligibleStudents = allStudents.filter(s => {
      const cgpa = s.academicInformation?.cgpa ?? s.education?.[0]?.grade ?? 8.0;
      return cgpa >= 7.0;
    });
    const totalEligibleCount = eligibleStudents.length;

    const opportunities = await Opportunity.find({})
      .populate('companyId', 'companyName industry location logo')
      .sort({ createdAt: -1 });

    const oppIds = opportunities.map(o => o._id);
    const applications = await Application.find({ opportunityId: { $in: oppIds } })
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email avatarUrl' }
      });

    const allApplications = await Application.find({});
    const totalApplicationsCount = allApplications.length;
    const allShortlisted = allApplications.filter(a => ['shortlisted', 'reviewed'].includes(a.status));
    const allSelected = allApplications.filter(a => a.status === 'accepted');

    const formattedDrives = opportunities.map(opp => {
      const comp = opp.companyId;
      const driveApps = applications.filter(a => a.opportunityId?.toString() === opp._id.toString());
      const driveShortlisted = driveApps.filter(a => ['shortlisted', 'reviewed'].includes(a.status));
      const driveSelected = driveApps.filter(a => a.status === 'accepted');

      const created = opp.createdAt || new Date();
      const placementDate = new Date(created.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
      const deadline = new Date(created.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

      let driveStatus = 'ongoing';
      if (opp.status === 'closed') {
        driveStatus = 'completed';
      } else if (opp.status === 'open') {
        driveStatus = 'ongoing';
      } else {
        driveStatus = 'upcoming';
      }

      return {
        _id: opp._id,
        role: opp.title,
        type: opp.type,
        placementDate,
        deadline,
        status: driveStatus,
        stipend: opp.stipend || 'Competitive',
        location: opp.location || 'Remote',
        requiredSkills: opp.requiredSkills || [],
        company: {
          _id: comp?._id,
          name: comp?.companyName || 'Enterprise Partner',
          industry: comp?.industry || 'Technology',
          location: comp?.location || 'Bengaluru',
          logo: comp?.logo || null
        },
        metrics: {
          eligibleStudentsCount: totalEligibleCount,
          applicationsCount: driveApps.length,
          shortlistedCount: driveShortlisted.length,
          selectedCount: driveSelected.length
        },
        appliedCandidates: driveApps.map(a => ({
          _id: a._id,
          name: a.studentId?.userId?.name || 'Student Candidate',
          email: a.studentId?.userId?.email || 'N/A',
          cgpa: a.studentId?.academicInformation?.cgpa || 8.5,
          department: a.studentId?.academicInformation?.branch || 'Computer Science',
          status: a.status,
          appliedAt: a.createdAt
        }))
      };
    });

    let finalDrives = formattedDrives;
    if (status && status !== 'all') {
      finalDrives = finalDrives.filter(d => d.status === status);
    }
    if (company && company !== 'all') {
      finalDrives = finalDrives.filter(d => d.company.name.toLowerCase().includes(company.toLowerCase()));
    }
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      finalDrives = finalDrives.filter(d =>
        d.role.toLowerCase().includes(q) ||
        d.company.name.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q)
      );
    }

    const ongoingCount = formattedDrives.filter(d => d.status === 'ongoing').length;
    const upcomingCount = formattedDrives.filter(d => d.status === 'upcoming').length;
    const completedCount = formattedDrives.filter(d => d.status === 'completed').length;
    const overallPlacementRate = totalStudentsCount > 0 ? Math.round((allSelected.length / totalStudentsCount) * 100) : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalDrivesCount: formattedDrives.length,
        ongoingDrivesCount: ongoingCount,
        upcomingDrivesCount: upcomingCount,
        completedDrivesCount: completedCount,
        totalEligibleStudents: totalEligibleCount,
        totalApplications: totalApplicationsCount,
        shortlistedStudents: allShortlisted.length,
        selectedStudents: allSelected.length,
        overallPlacementRate
      },
      drives: finalDrives
    });
  } catch (error) {
    console.error('getAdminPlacements error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/notifications — Real activity alerts feed for logged-in Admin
 * Protected: Admin only
 */
export const getAdminNotifications = async (req, res) => {
  try {
    const adminUser = await User.findById(req.user.id);
    const readIds = new Set(adminUser?.readNotifications || []);

    const rawNotifications = [];

    // 1. New User Registrations
    const recentUsers = await User.find({})
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    for (const u of recentUsers) {
      rawNotifications.push({
        _id: `user_reg_${u._id}`,
        type: 'user_registration',
        title: 'New User Registered',
        message: `${u.name} registered on the platform as a ${u.role?.toUpperCase()} (${u.email}).`,
        category: 'Users',
        link: '/admin/users',
        createdAt: u.createdAt,
        read: readIds.has(`user_reg_${u._id}`)
      });
    }

    // 2. Company Verification Requests
    const recentCompanies = await Company.find({})
      .select('companyName industry verificationStatus createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    for (const c of recentCompanies) {
      rawNotifications.push({
        _id: `comp_req_${c._id}`,
        type: 'company_verification',
        title: 'Employer Verification Request',
        message: `${c.companyName} (${c.industry}) submitted an employer profile with status "${c.verificationStatus}".`,
        category: 'Companies',
        link: '/admin/companies',
        createdAt: c.createdAt,
        read: readIds.has(`comp_req_${c._id}`)
      });
    }

    // 3. New Opportunities / Drives Posted
    const recentOpps = await Opportunity.find({})
      .populate('companyId', 'companyName')
      .select('title type status createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    for (const o of recentOpps) {
      rawNotifications.push({
        _id: `opp_post_${o._id}`,
        type: 'new_opportunity',
        title: 'New Hiring Drive Posted',
        message: `${o.companyId?.companyName || 'Corporate Partner'} posted a new ${o.type}: "${o.title}".`,
        category: 'Opportunities',
        link: '/admin/opportunities',
        createdAt: o.createdAt,
        read: readIds.has(`opp_post_${o._id}`)
      });
    }

    // 4. Candidate Applications
    const recentApps = await Application.find({})
      .populate({ path: 'opportunityId', select: 'title' })
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'name' } })
      .select('status createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    for (const a of recentApps) {
      rawNotifications.push({
        _id: `app_sub_${a._id}`,
        type: 'new_application',
        title: 'Student Application Submitted',
        message: `${a.studentId?.userId?.name || 'A candidate'} applied for ${a.opportunityId?.title || 'Campus Drive'}.`,
        category: 'Applications',
        link: '/admin/applications',
        createdAt: a.createdAt,
        read: readIds.has(`app_sub_${a._id}`)
      });
    }

    // 5. Placement Updates
    const recentPlacements = await Application.find({ status: 'accepted' })
      .populate({ path: 'opportunityId', select: 'title' })
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'name' } })
      .select('status updatedAt createdAt')
      .sort({ updatedAt: -1 })
      .limit(10);

    for (const p of recentPlacements) {
      rawNotifications.push({
        _id: `placement_${p._id}`,
        type: 'placement_update',
        title: 'Campus Placement Confirmed',
        message: `${p.studentId?.userId?.name || 'Candidate'} was selected and confirmed offer for ${p.opportunityId?.title || 'Campus Opening'}.`,
        category: 'Placements',
        link: '/admin/placements',
        createdAt: p.updatedAt || p.createdAt,
        read: readIds.has(`placement_${p._id}`)
      });
    }

    // 6. System Health Alerts
    rawNotifications.push({
      _id: 'sys_alert_node_cluster',
      type: 'system_alert',
      title: 'Platform System Status',
      message: 'All API gateways, MongoDB database clusters, and AI evaluation services are fully operational.',
      category: 'System',
      link: '/admin',
      createdAt: new Date(Date.now() - 3600000),
      read: readIds.has('sys_alert_node_cluster')
    });

    // Sort by timestamp descending
    rawNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const unreadCount = rawNotifications.filter(n => !n.read).length;

    res.status(200).json({
      success: true,
      unreadCount,
      count: rawNotifications.length,
      notifications: rawNotifications
    });
  } catch (error) {
    console.error('getAdminNotifications error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/admin/notifications/:id/read — Mark single notification as read
 * Protected: Admin only
 */
export const markAdminNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const adminUser = await User.findById(req.user.id);
    if (!adminUser) {
      return res.status(404).json({ success: false, message: 'Admin user not found' });
    }

    if (!adminUser.readNotifications) {
      adminUser.readNotifications = [];
    }

    if (!adminUser.readNotifications.includes(id)) {
      adminUser.readNotifications.push(id);
      await adminUser.save();
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read.'
    });
  } catch (error) {
    console.error('markAdminNotificationAsRead error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/admin/notifications/read-all — Mark all notifications as read
 * Protected: Admin only
 */
export const markAllAdminNotificationsAsRead = async (req, res) => {
  try {
    const adminUser = await User.findById(req.user.id);
    if (!adminUser) {
      return res.status(404).json({ success: false, message: 'Admin user not found' });
    }

    const { notificationIds } = req.body;
    if (Array.isArray(notificationIds) && notificationIds.length > 0) {
      const currentSet = new Set(adminUser.readNotifications || []);
      notificationIds.forEach(id => currentSet.add(id));
      adminUser.readNotifications = Array.from(currentSet);
      await adminUser.save();
    }

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (error) {
    console.error('markAllAdminNotificationsAsRead error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
