import Application from '../models/Application.js';
import StudentProfile from '../models/StudentProfile.js';
import Opportunity from '../models/Opportunity.js';
import Company from '../models/Company.js';
import { calculateCompatibility, matchSkills } from '../utils/matchingEngine.js';

export const applyOpportunity = async (req, res) => {
  try {
    const { opportunityId, coverLetter, resumeUrl } = req.body;
    if (!opportunityId) {
      return res.status(400).json({ success: false, message: 'Opportunity ID is required' });
    }

    const userId = req.user?.id || req.user?._id;
    let student = await StudentProfile.findOne({ userId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found. Please complete your registration details.' });
    }

    const opp = await Opportunity.findById(opportunityId).populate('companyId', 'companyName');
    if (!opp) {
      return res.status(404).json({ success: false, message: 'Opportunity posting not found' });
    }

    // 1. Check Opportunity Status
    if (opp.status !== 'open') {
      return res.status(400).json({ success: false, message: 'This opportunity is closed for applications.' });
    }

    // 2. Check Application Deadline
    if (opp.deadline && new Date(opp.deadline) < new Date()) {
      return res.status(400).json({ 
        success: false, 
        message: `The application deadline (${new Date(opp.deadline).toLocaleDateString()}) for this opportunity has expired.` 
      });
    }

    // 3. Prevent Duplicate Applications
    const existingApp = await Application.findOne({ studentId: student._id, opportunityId });
    if (existingApp) {
      return res.status(400).json({ success: false, message: 'You have already applied for this opening.' });
    }

    // 4. Check Required Eligibility (CGPA and Department if specified)
    if (opp.minCgpa && student.academicInformation?.cgpa !== null && student.academicInformation?.cgpa !== undefined) {
      const studentCgpa = Number(student.academicInformation.cgpa);
      if (studentCgpa < opp.minCgpa) {
        return res.status(400).json({ 
          success: false, 
          message: `Eligibility Requirement: Minimum CGPA of ${opp.minCgpa} required. Your recorded CGPA is ${studentCgpa}.` 
        });
      }
    }

    if (Array.isArray(opp.eligibleBranches) && opp.eligibleBranches.length > 0) {
      const studentBranch = (student.academicInformation?.branch || student.academicInformation?.department || '').toLowerCase().trim();
      const isEligible = opp.eligibleBranches.some(b => studentBranch.includes(b.toLowerCase().trim()) || b.toLowerCase().trim().includes(studentBranch));
      if (!isEligible && studentBranch) {
        return res.status(400).json({
          success: false,
          message: `Eligibility Requirement: This position is open for ${opp.eligibleBranches.join(', ')} students.`
        });
      }
    }

    // 5. Use Student's Existing Verified Resume
    const finalResume = (resumeUrl && resumeUrl.trim()) || (student.resumeUrl && student.resumeUrl.trim());
    if (!finalResume) {
      return res.status(400).json({
        success: false,
        message: 'Please upload or provide a verified resume in your profile before applying.'
      });
    }

    // 6. Create Application with status = 'applied'
    const application = await Application.create({
      opportunityId,
      studentId: student._id,
      resumeUrl: finalResume,
      coverLetter: coverLetter ? coverLetter.trim() : '',
      status: 'applied'
    });

    const populatedApplication = await Application.findById(application._id)
      .populate({
        path: 'opportunityId',
        select: 'title type location stipend duration status requiredSkills',
        populate: { path: 'companyId', select: 'companyName industry location' }
      });

    res.status(201).json({ 
      success: true, 
      message: 'Application submitted successfully!', 
      application: populatedApplication 
    });
  } catch (error) {
    console.error('Apply Opportunity Error:', error.message);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already applied for this opening.' });
    }
    res.status(500).json({ success: false, message: 'Server error submitting application: ' + error.message });
  }
};

export const getStudentApplications = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const student = await StudentProfile.findOne({ userId });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

    const applications = await Application.find({ studentId: student._id })
      .populate({
        path: 'opportunityId',
        select: 'title type location stipend duration status requiredSkills',
        populate: { path: 'companyId', select: 'companyName industry location' }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: applications.length, applications });
  } catch (error) {
    console.error('Get Student Applications Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving applications list: ' + error.message });
  }
};

export const getStudentInterviews = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const student = await StudentProfile.findOne({ userId });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

    const applications = await Application.find({
      studentId: student._id,
      $or: [
        { status: 'interview' },
        { 'interviewDetails.scheduledAt': { $exists: true, $ne: null } }
      ]
    })
      .populate({
        path: 'opportunityId',
        select: 'title type location stipend duration status requiredSkills',
        populate: { path: 'companyId', select: 'companyName industry location' }
      })
      .sort({ 'interviewDetails.scheduledAt': 1, updatedAt: -1 });

    const interviews = applications.map(app => {
      const opp = app.opportunityId || {};
      const company = opp.companyId || {};
      const details = app.interviewDetails || {};
      const scheduledDate = details.scheduledAt ? new Date(details.scheduledAt) : new Date(app.updatedAt);

      return {
        _id: app._id,
        applicationId: app._id,
        opportunity: {
          _id: opp._id,
          title: opp.title || 'Position',
          type: opp.type || 'job',
          location: opp.location || 'Remote',
          companyName: company.companyName || 'Corporate Partner'
        },
        scheduledAt: details.scheduledAt || null,
        date: scheduledDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: scheduledDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        mode: details.mode || 'video',
        round: details.round || 'Technical Evaluation',
        meetingLink: details.meetingLink || 'https://meet.google.com',
        notes: details.notes || '',
        status: details.status || 'scheduled',
        applicationStatus: app.status
      };
    });

    res.status(200).json({ success: true, count: interviews.length, interviews });
  } catch (error) {
    console.error('Get Student Interviews Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving student interviews: ' + error.message });
  }
};

export const getOpportunityApplicants = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user.id });
    if (!company) return res.status(404).json({ success: false, message: 'Company profile not found' });

    const opp = await Opportunity.findById(req.params.opportunityId);
    if (!opp) return res.status(404).json({ success: false, message: 'Opportunity posting not found' });
    if (opp.companyId.toString() !== company._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to view applicants for this posting' });
    }

    const applications = await Application.find({ opportunityId: req.params.opportunityId })
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email' } });

    const formatted = applications.map(app => {
      const obj = app.toObject();
      obj.compatibilityScore = obj.studentId ? calculateCompatibility(obj.studentId, opp) : 0;
      return obj;
    }).sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    res.status(200).json({ success: true, count: formatted.length, applications: formatted });
  } catch (error) {
    console.error('Get Opportunity Applicants Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving applicants list' });
  }
};

export const getCompanyApplications = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const company = await Company.findOne({ userId });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }

    const opportunities = await Opportunity.find({ companyId: company._id });
    const oppIds = opportunities.map(o => o._id);

    const query = { opportunityId: { $in: oppIds } };
    if (req.query.opportunityId && req.query.opportunityId !== 'all') {
      query.opportunityId = req.query.opportunityId;
    }
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }

    const applications = await Application.find(query)
      .populate('opportunityId', 'title type location stipend duration status requiredSkills')
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'name email avatarUrl'
        }
      })
      .sort({ createdAt: -1 });

    const formatted = applications.map(app => {
      const obj = app.toObject();
      const opp = obj.opportunityId;
      if (obj.studentId && opp) {
        const match = matchSkills(obj.studentId, opp);
        obj.matchPercentage = match.matchPercentage;
        obj.matchedSkills = match.matchedSkills;
        obj.missingSkills = match.missingSkills;
        obj.compatibilityScore = match.matchPercentage;
      } else {
        obj.compatibilityScore = null;
      }
      return obj;
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      applications: formatted,
      opportunities: opportunities.map(o => ({ _id: o._id, title: o.title, type: o.type, status: o.status }))
    });
  } catch (error) {
    console.error('Get Company Applications Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving applications list: ' + error.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['applied', 'reviewed', 'shortlisted', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid application status (applied, reviewed, shortlisted, accepted, rejected)'
      });
    }

    const userId = req.user?.id || req.user?._id;
    const company = await Company.findOne({ userId });
    if (!company) return res.status(404).json({ success: false, message: 'Company profile not found' });

    const application = await Application.findById(req.params.id)
      .populate('opportunityId')
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email' }
      });

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    if (application.opportunityId.companyId.toString() !== company._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to modify applicants for this posting' });
    }

    application.status = status;
    await application.save();

    res.status(200).json({ 
      success: true, 
      message: `Candidate status successfully updated to: ${status}`, 
      application 
    });
  } catch (error) {
    console.error('Update Application Status Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating application status: ' + error.message });
  }
};
