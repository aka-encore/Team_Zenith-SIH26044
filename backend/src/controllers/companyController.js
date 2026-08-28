import Company from '../models/Company.js';
import User from '../models/User.js';
import Opportunity from '../models/Opportunity.js';
import Application from '../models/Application.js';
import StudentProfile from '../models/StudentProfile.js';

export const getProfile = async (req, res) => {
  try {
    const profile = await Company.findOne({ userId: req.user.id }).populate('userId', 'name email role');
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }
    res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error('Get Company Profile Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving company profile' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { 
      companyName, logoUrl, industry, description, website, location, 
      hrName, contactPhone, contactEmail, hrEmail, companySize, foundedYear 
    } = req.body;
    
    const profile = await Company.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }

    if (companyName) {
      profile.companyName = companyName.trim();
      await User.findByIdAndUpdate(req.user.id, { name: companyName.trim() });
    }
    if (logoUrl !== undefined) profile.logoUrl = logoUrl.trim();
    if (industry !== undefined) profile.industry = industry.trim();
    if (description !== undefined) profile.description = description.trim();
    if (website !== undefined) profile.website = website.trim();
    if (location !== undefined) profile.location = location.trim();
    if (hrName !== undefined) profile.hrName = hrName.trim();
    if (contactPhone !== undefined) profile.contactPhone = contactPhone.trim();
    if (contactEmail !== undefined || hrEmail !== undefined) {
      profile.contactEmail = (contactEmail || hrEmail || '').trim();
    }
    if (companySize !== undefined) profile.companySize = companySize.trim();
    if (foundedYear !== undefined) profile.foundedYear = foundedYear.toString().trim();

    await profile.save();
    const updatedProfile = await Company.findOne({ userId: req.user.id }).populate('userId', 'name email role');
    res.status(200).json({ success: true, message: 'Company profile updated successfully!', profile: updatedProfile });
  } catch (error) {
    console.error('Update Company Profile Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating company profile' });
  }
};

export const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please provide an image file for company logo' });
    }
    const logoUrl = `/uploads/profiles/${req.file.filename}`;
    const profile = await Company.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }
    profile.logoUrl = logoUrl;
    await profile.save();
    res.status(200).json({ success: true, message: 'Company logo uploaded successfully!', logoUrl, profile });
  } catch (error) {
    console.error('Upload Company Logo Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error uploading company logo' });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user.id });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }

    // 1. Fetch all opportunities belonging strictly to this company
    const opportunities = await Opportunity.find({ companyId: company._id }).sort({ createdAt: -1 });
    const oppIds = opportunities.map(o => o._id);

    // 2. Fetch all applications belonging strictly to this company's opportunities
    const applications = await Application.find({ opportunityId: { $in: oppIds } })
      .populate({
        path: 'opportunityId',
        select: 'title type status location stipend duration requiredSkills'
      })
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'name email avatarUrl'
        },
        select: 'academicInformation skillsList skills resumeUrl'
      })
      .sort({ createdAt: -1 });

    // 3. Compute Overview Metrics
    const activeJobs = opportunities.filter(o => o.type === 'job' && o.status === 'open').length;
    const activeInternships = opportunities.filter(o => o.type === 'internship' && o.status === 'open').length;
    const totalApplicants = applications.length;
    const shortlistedCount = applications.filter(a => ['shortlisted', 'accepted'].includes((a.status || '').toLowerCase())).length;

    // 4. Map application counts per opportunity
    const appCountByOpp = {};
    applications.forEach(app => {
      const oppId = app.opportunityId?._id?.toString() || app.opportunityId?.toString();
      if (oppId) {
        appCountByOpp[oppId] = (appCountByOpp[oppId] || 0) + 1;
      }
    });

    const formattedOpportunities = opportunities.map(opp => ({
      _id: opp._id,
      title: opp.title,
      type: opp.type,
      status: opp.status,
      location: opp.location,
      stipend: opp.stipend,
      duration: opp.duration,
      requiredSkills: opp.requiredSkills || [],
      applicantCount: appCountByOpp[opp._id.toString()] || 0,
      createdAt: opp.createdAt
    }));

    // 5. Recent applicants (latest 6)
    const recentApplicants = applications.slice(0, 6).map(app => {
      const student = app.studentId;
      const user = student?.userId;
      const skills = (student?.skillsList && student.skillsList.length > 0)
        ? student.skillsList.map(s => s.name)
        : (student?.skills || []);

      return {
        _id: app._id,
        studentName: user?.name || 'Applicant',
        studentEmail: user?.email || '',
        avatarUrl: user?.avatarUrl || null,
        college: student?.academicInformation?.college || student?.academicInformation?.degree || 'Student',
        degree: student?.academicInformation?.degree || '',
        branch: student?.academicInformation?.branch || '',
        cgpa: student?.academicInformation?.cgpa ?? null,
        skills: skills.slice(0, 5),
        positionTitle: app.opportunityId?.title || 'Applied Position',
        positionType: app.opportunityId?.type || 'job',
        status: app.status || 'applied',
        appliedAt: app.createdAt,
        resumeUrl: app.resumeUrl || student?.resumeUrl || ''
      };
    });

    // 6. Upcoming Interviews (candidates in 'shortlisted' or 'accepted' state)
    const interviewApplicants = applications.filter(a => ['shortlisted', 'accepted'].includes((a.status || '').toLowerCase()));
    const upcomingInterviews = interviewApplicants.map(app => {
      const student = app.studentId;
      const user = student?.userId;
      const scheduledDate = new Date(app.updatedAt || app.createdAt);
      scheduledDate.setDate(scheduledDate.getDate() + 2);

      return {
        _id: app._id,
        studentName: user?.name || 'Candidate',
        studentEmail: user?.email || '',
        avatarUrl: user?.avatarUrl || null,
        positionTitle: app.opportunityId?.title || 'Role',
        positionType: app.opportunityId?.type || 'job',
        date: scheduledDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: '11:00 AM - 12:00 PM IST',
        mode: 'Virtual Video (Google Meet)',
        meetingLink: 'https://meet.google.com',
        round: app.status === 'accepted' ? 'Offer Extended & Briefing' : 'Technical Evaluation Round 1',
        status: app.status === 'accepted' ? 'Offer Extended' : 'Interview Scheduled'
      };
    });

    // 7. Hiring Insights
    const skillMap = {};
    applications.forEach(app => {
      const student = app.studentId;
      const skills = (student?.skillsList && student.skillsList.length > 0)
        ? student.skillsList.map(s => s.name)
        : (student?.skills || []);
      skills.forEach(sk => {
        if (sk) {
          const norm = sk.trim();
          skillMap[norm] = (skillMap[norm] || 0) + 1;
        }
      });
    });

    const commonSkills = Object.entries(skillMap)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const stageBreakdown = {
      applied: applications.filter(a => a.status === 'applied').length,
      reviewed: applications.filter(a => a.status === 'reviewed').length,
      shortlisted: applications.filter(a => a.status === 'shortlisted').length,
      accepted: applications.filter(a => a.status === 'accepted').length,
      rejected: applications.filter(a => a.status === 'rejected').length
    };

    res.status(200).json({
      success: true,
      company: {
        _id: company._id,
        companyName: company.companyName,
        industry: company.industry,
        location: company.location,
        verificationStatus: company.verificationStatus
      },
      stats: {
        activeJobs,
        activeInternships,
        totalApplicants,
        shortlistedCount,
        interviewCount: upcomingInterviews.length
      },
      opportunities: formattedOpportunities,
      recentApplicants,
      upcomingInterviews,
      insights: {
        commonSkills,
        stageBreakdown,
        applicantsByOpportunity: formattedOpportunities.map(o => ({
          opportunityId: o._id,
          title: o.title,
          type: o.type,
          count: o.applicantCount
        }))
      }
    });

  } catch (error) {
    console.error('Get Company Dashboard Stats Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving dashboard stats' });
  }
};

export const getAllCompaniesAdmin = async (req, res) => {
  try {
    const companies = await Company.find({}).populate('userId', 'name email role status').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: companies.length, companies });
  } catch (error) {
    console.error('Get All Companies Admin Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving companies list' });
  }
};

export const verifyCompanyAdmin = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'verified', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid verification status (pending, verified, rejected)'
      });
    }

    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }

    company.verificationStatus = status;
    await company.save();
    // Keep User.status in sync so verified recruiters can log in
    await User.findByIdAndUpdate(company.userId, {
      status: status === 'verified' ? 'active' : status === 'rejected' ? 'inactive' : 'pending'
    });

    res.status(200).json({
      success: true,
      message: `Company verification status set to: ${status}`,
      company
    });
  } catch (error) {
    console.error('Verify Company Admin Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating company verification status' });
  }
};

export const searchStudents = async (req, res) => {
  try {
    const { skill, department, year, minCgpa, skillLevel, search } = req.query;

    const query = {};

    // 1. Skill filter
    if (skill && skill.trim()) {
      const regex = new RegExp(skill.trim(), 'i');
      query.$or = [
        { skills: regex },
        { 'skillsList.name': regex }
      ];
    }

    // 2. Department / Branch filter
    if (department && department.trim() && department !== 'all') {
      const deptRegex = new RegExp(department.trim(), 'i');
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { 'academicInformation.branch': deptRegex },
          { 'academicInformation.department': deptRegex },
          { 'education.fieldOfStudy': deptRegex }
        ]
      });
    }

    // 3. Year filter
    if (year && year.trim() && year !== 'all') {
      const yearRegex = new RegExp(year.trim(), 'i');
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { 'academicInformation.yearOfStudy': yearRegex },
          { 'academicInformation.expectedGraduationYear': year.trim() },
          { 'education.graduationYear': year.trim() }
        ]
      });
    }

    // 4. CGPA filter
    if (minCgpa && !isNaN(Number(minCgpa))) {
      const cgpaVal = Number(minCgpa);
      query['academicInformation.cgpa'] = { $gte: cgpaVal };
    }

    // 5. Skill level filter
    if (skillLevel && skillLevel.trim() && skillLevel !== 'all') {
      query['skillsList.proficiencyLevel'] = new RegExp(`^${skillLevel.trim()}$`, 'i');
    }

    // 6. Query from database with populated user information
    let studentProfiles = await StudentProfile.find(query)
      .populate('userId', 'name email avatarUrl status')
      .sort({ overallScore: -1, 'academicInformation.cgpa': -1, createdAt: -1 });

    studentProfiles = studentProfiles.filter(sp => sp.userId && sp.userId.status !== 'inactive');

    // If search term provided, filter against name, college, branch, or skills
    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      studentProfiles = studentProfiles.filter(sp => {
        const name = (sp.userId?.name || '').toLowerCase();
        const college = (sp.academicInformation?.college || '').toLowerCase();
        const branch = (sp.academicInformation?.branch || '').toLowerCase();
        const skills = (sp.skillsList?.map(sk => sk.name.toLowerCase()) || []).concat(sp.skills?.map(sk => sk.toLowerCase()) || []);
        return name.includes(s) || college.includes(s) || branch.includes(s) || skills.some(sk => sk.includes(s));
      });
    }

    // Format safe response for corporate recruiter view
    const formatted = studentProfiles.map(sp => {
      const u = sp.userId;
      const skills = (sp.skillsList && sp.skillsList.length > 0)
        ? sp.skillsList.map(s => ({
            name: s.name,
            proficiencyLevel: s.proficiencyLevel || 'Intermediate',
            verified: s.verified || false
          }))
        : (sp.skills || []).map(s => ({
            name: s,
            proficiencyLevel: 'Intermediate',
            verified: false
          }));

      return {
        _id: sp._id,
        studentId: sp._id,
        name: u?.name || 'Student Candidate',
        email: u?.email || '',
        avatarUrl: u?.avatarUrl || null,
        college: sp.academicInformation?.college || sp.education?.[0]?.institutionName || 'Zenith Institute of Technology & Engineering',
        department: sp.academicInformation?.branch || sp.academicInformation?.department || sp.education?.[0]?.fieldOfStudy || 'Computer Science & Engineering',
        year: sp.academicInformation?.yearOfStudy || sp.academicInformation?.expectedGraduationYear || sp.education?.[0]?.graduationYear || '3rd Year',
        cgpa: sp.academicInformation?.cgpa ?? sp.education?.[0]?.grade ?? 8.5,
        skills,
        bio: sp.bio || '',
        overallScore: sp.overallScore || 85,
        projects: sp.projects || [],
        certifications: sp.certifications || [],
        resumeUrl: sp.resumeUrl || ''
      };
    });

    const company = await Company.findOne({ userId: req.user.id });
    const opportunities = company ? await Opportunity.find({ companyId: company._id, status: 'open' }).select('_id title type') : [];

    res.status(200).json({
      success: true,
      count: formatted.length,
      students: formatted,
      opportunities
    });
  } catch (error) {
    console.error('Search Students Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving students catalog' });
  }
};

export const shortlistStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { opportunityId, notes } = req.body;

    const company = await Company.findOne({ userId: req.user.id });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }

    const student = await StudentProfile.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    let targetOppId = opportunityId;
    if (!targetOppId) {
      const defaultOpp = await Opportunity.findOne({ companyId: company._id, status: 'open' });
      if (defaultOpp) {
        targetOppId = defaultOpp._id;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Please select an open opportunity to shortlist this candidate for, or post a new opportunity first.'
        });
      }
    }

    let application = await Application.findOne({ studentId: student._id, opportunityId: targetOppId });
    if (application) {
      application.status = 'shortlisted';
      await application.save();
    } else {
      application = await Application.create({
        opportunityId: targetOppId,
        studentId: student._id,
        status: 'shortlisted',
        resumeUrl: student.resumeUrl || 'https://skillnexus.ai/resumes/default.pdf',
        coverLetter: notes || 'Recruiter direct shortlist from Student Talent Discovery'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student successfully shortlisted for this opportunity!',
      application
    });
  } catch (error) {
    console.error('Shortlist Student Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error shortlisting candidate' });
  }
};

export const getShortlistedStudents = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user.id });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }

    const opportunities = await Opportunity.find({ companyId: company._id });
    const oppIds = opportunities.map(o => o._id);

    const applications = await Application.find({
      opportunityId: { $in: oppIds },
      status: { $in: ['shortlisted', 'accepted'] }
    })
      .populate('opportunityId', 'title type location stipend duration status')
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'name email avatarUrl status'
        }
      })
      .sort({ updatedAt: -1 });

    const formatted = applications.map(app => {
      const student = app.studentId;
      const u = student?.userId;
      const skills = (student?.skillsList && student.skillsList.length > 0)
        ? student.skillsList.map(s => ({
            name: s.name,
            proficiencyLevel: s.proficiencyLevel || 'Intermediate'
          }))
        : (student?.skills || []).map(s => ({
            name: s,
            proficiencyLevel: 'Intermediate'
          }));

      return {
        _id: app._id,
        applicationId: app._id,
        studentId: student?._id,
        name: u?.name || 'Student Candidate',
        email: u?.email || '',
        avatarUrl: u?.avatarUrl || null,
        college: student?.academicInformation?.college || student?.education?.[0]?.institutionName || 'Zenith Institute of Technology & Engineering',
        department: student?.academicInformation?.branch || student?.academicInformation?.department || student?.education?.[0]?.fieldOfStudy || 'Computer Science & Engineering',
        cgpa: student?.academicInformation?.cgpa ?? student?.education?.[0]?.grade ?? 8.5,
        skills,
        bio: student?.bio || '',
        projects: student?.projects || [],
        certifications: student?.certifications || [],
        resumeUrl: app.resumeUrl || student?.resumeUrl || '',
        opportunity: {
          _id: app.opportunityId?._id,
          title: app.opportunityId?.title || 'Open Role',
          type: app.opportunityId?.type || 'job',
          location: app.opportunityId?.location || 'Remote',
          stipend: app.opportunityId?.stipend || 'Competitive'
        },
        status: app.status,
        shortlistedDate: app.updatedAt || app.createdAt,
        interviewDetails: app.interviewDetails || null
      };
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      shortlisted: formatted
    });
  } catch (error) {
    console.error('Get Shortlisted Students Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving shortlisted candidates' });
  }
};

export const scheduleInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, mode, round, meetingLink, notes, status } = req.body;

    const company = await Company.findOne({ userId: req.user.id });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }

    const application = await Application.findById(id).populate('opportunityId');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.opportunityId.companyId.toString() !== company._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to schedule interviews for this applicant' });
    }

    const scheduledDateTime = date ? new Date(`${date}T${time || '10:00'}:00`) : new Date();

    application.interviewDetails = {
      scheduledAt: scheduledDateTime,
      mode: mode || 'video',
      round: round || 'Technical Evaluation Round 1',
      meetingLink: meetingLink || 'https://meet.google.com',
      notes: notes || '',
      status: status || 'scheduled'
    };
    if (status === 'completed') {
      application.status = 'accepted';
    } else {
      application.status = 'shortlisted';
    }

    await application.save();

    res.status(200).json({
      success: true,
      message: 'Interview successfully scheduled / updated!',
      application
    });
  } catch (error) {
    console.error('Schedule Interview Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error scheduling candidate interview' });
  }
};

export const getCompanyInterviews = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user.id });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }

    const opportunities = await Opportunity.find({ companyId: company._id });
    const oppIds = opportunities.map(o => o._id);

    const applications = await Application.find({
      opportunityId: { $in: oppIds },
      $or: [
        { 'interviewDetails.scheduledAt': { $exists: true, $ne: null } },
        { status: { $in: ['shortlisted', 'accepted'] } }
      ]
    })
      .populate('opportunityId', 'title type location stipend duration status')
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'name email avatarUrl'
        }
      })
      .sort({ 'interviewDetails.scheduledAt': -1, updatedAt: -1 });

    const interviews = applications.map(app => {
      const student = app.studentId;
      const u = student?.userId;
      const interview = app.interviewDetails || {};
      const scheduledDate = interview.scheduledAt ? new Date(interview.scheduledAt) : new Date(app.updatedAt);

      return {
        _id: app._id,
        applicationId: app._id,
        studentId: student?._id,
        studentName: u?.name || 'Candidate',
        studentEmail: u?.email || '',
        avatarUrl: u?.avatarUrl || null,
        college: student?.academicInformation?.college || student?.education?.[0]?.institutionName || 'Zenith University Partner',
        department: student?.academicInformation?.branch || student?.academicInformation?.department || 'Computer Science & Engineering',
        opportunity: {
          _id: app.opportunityId?._id,
          title: app.opportunityId?.title || 'Open Opportunity',
          type: app.opportunityId?.type || 'job',
          location: app.opportunityId?.location || 'Remote'
        },
        rawDate: scheduledDate,
        date: scheduledDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: scheduledDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        mode: interview.mode || 'video',
        round: interview.round || 'Technical Evaluation Round 1',
        meetingLink: interview.meetingLink || 'https://meet.google.com',
        notes: interview.notes || '',
        status: interview.status || (app.status === 'accepted' ? 'completed' : 'scheduled')
      };
    });

    const availableCandidates = applications.map(app => ({
      applicationId: app._id,
      studentName: app.studentId?.userId?.name || 'Candidate',
      opportunityTitle: app.opportunityId?.title || 'Role'
    }));

    res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
      opportunities: opportunities.map(o => ({ _id: o._id, title: o.title, type: o.type })),
      availableCandidates
    });
  } catch (error) {
    console.error('Get Company Interviews Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving company interviews' });
  }
};

export const cancelInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Company.findOne({ userId: req.user.id });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }

    const application = await Application.findById(id).populate('opportunityId');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.opportunityId.companyId.toString() !== company._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this interview' });
    }

    if (application.interviewDetails) {
      application.interviewDetails.status = 'cancelled';
    } else {
      application.interviewDetails = { status: 'cancelled' };
    }
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Interview marked as cancelled.',
      application
    });
  } catch (error) {
    console.error('Cancel Interview Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error cancelling interview' });
  }
};

export const getCompanyNotifications = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user.id });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }

    const opportunities = await Opportunity.find({ companyId: company._id }).sort({ createdAt: -1 });
    const oppIds = opportunities.map(o => o._id);

    const applications = await Application.find({ opportunityId: { $in: oppIds } })
      .populate('opportunityId', 'title type')
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'name email avatarUrl'
        }
      })
      .sort({ updatedAt: -1, createdAt: -1 });

    const readIds = new Set(company.readNotifications || []);
    const notifications = [];

    // 1. Notifications for Applications
    applications.forEach(app => {
      const studentName = app.studentId?.userId?.name || 'A student candidate';
      const oppTitle = app.opportunityId?.title || 'your open opportunity';
      const oppType = app.opportunityId?.type || 'job';

      // (a) New Application Notification
      const appId = `app_received_${app._id}`;
      notifications.push({
        id: appId,
        type: 'application',
        title: 'New Application Received',
        message: `${studentName} applied for ${oppTitle} (${oppType}).`,
        timestamp: app.createdAt,
        read: readIds.has(appId),
        link: '/company/applicants',
        meta: { studentName, oppTitle }
      });

      // (b) Shortlist Notification (if status is shortlisted or accepted)
      if (['shortlisted', 'accepted'].includes((app.status || '').toLowerCase())) {
        const shortId = `app_shortlisted_${app._id}`;
        notifications.push({
          id: shortId,
          type: 'shortlist',
          title: 'Candidate Shortlisted',
          message: `${studentName} is shortlisted for ${oppTitle}.`,
          timestamp: app.updatedAt,
          read: readIds.has(shortId),
          link: '/company/shortlisted',
          meta: { studentName, oppTitle }
        });
      }

      // (c) Interview Scheduled / Cancelled Notification
      if (app.interviewDetails?.scheduledAt) {
        const isCancelled = app.interviewDetails.status === 'cancelled';
        const intId = isCancelled ? `interview_cancelled_${app._id}` : `interview_sched_${app._id}`;
        const formattedDate = new Date(app.interviewDetails.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        notifications.push({
          id: intId,
          type: isCancelled ? 'interview_cancelled' : 'interview_scheduled',
          title: isCancelled ? 'Interview Cancelled' : 'Interview Scheduled',
          message: isCancelled 
            ? `The scheduled interview with ${studentName} for ${oppTitle} has been cancelled.`
            : `Interview scheduled with ${studentName} for ${oppTitle} on ${formattedDate} (${app.interviewDetails.mode || 'video'}).`,
          timestamp: app.interviewDetails.scheduledAt || app.updatedAt,
          read: readIds.has(intId),
          link: '/company/interviews',
          meta: { studentName, oppTitle, mode: app.interviewDetails.mode }
        });
      }
    });

    // 2. Notifications for Opportunity Activity
    opportunities.forEach(opp => {
      const oppNotifId = `opp_created_${opp._id}`;
      notifications.push({
        id: oppNotifId,
        type: 'opportunity',
        title: 'Opportunity Live',
        message: `Your ${opp.type} listing "${opp.title}" is active and accepting candidate applications.`,
        timestamp: opp.createdAt,
        read: readIds.has(oppNotifId),
        link: '/company/opportunities',
        meta: { oppTitle: opp.title, oppType: opp.type }
      });
    });

    // Sort notifications chronologically (newest first)
    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const unreadCount = notifications.filter(n => !n.read).length;

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications
    });
  } catch (error) {
    console.error('Get Company Notifications Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving company notifications' });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Company.findOne({ userId: req.user.id });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }

    if (!company.readNotifications) company.readNotifications = [];
    if (!company.readNotifications.includes(id)) {
      company.readNotifications.push(id);
      await company.save();
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      readNotifications: company.readNotifications
    });
  } catch (error) {
    console.error('Mark Notification Read Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating notification status' });
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;
    const company = await Company.findOne({ userId: req.user.id });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }

    if (Array.isArray(notificationIds) && notificationIds.length > 0) {
      const existing = new Set(company.readNotifications || []);
      notificationIds.forEach(id => existing.add(id));
      company.readNotifications = Array.from(existing);
      await company.save();
    }

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
      readNotifications: company.readNotifications
    });
  } catch (error) {
    console.error('Mark All Notifications Read Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating notifications status' });
  }
};

