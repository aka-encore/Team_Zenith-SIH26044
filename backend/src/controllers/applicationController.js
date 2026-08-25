import Application from '../models/Application.js';
import StudentProfile from '../models/StudentProfile.js';
import Opportunity from '../models/Opportunity.js';
import Company from '../models/Company.js';
import { calculateCompatibility } from '../utils/matchingEngine.js';

export const applyOpportunity = async (req, res) => {
  try {
    const { opportunityId, coverLetter, resumeUrl } = req.body;
    if (!opportunityId) {
      return res.status(400).json({ success: false, message: 'Opportunity ID is required' });
    }

    const student = await StudentProfile.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found. Please complete your registration details.' });
    }

    const opp = await Opportunity.findById(opportunityId);
    if (!opp) return res.status(404).json({ success: false, message: 'Opportunity posting not found' });
    if (opp.status !== 'open') {
      return res.status(400).json({ success: false, message: 'This opportunity is closed for applications.' });
    }

    if (await Application.findOne({ studentId: student._id, opportunityId })) {
      return res.status(400).json({ success: false, message: 'You have already applied for this opening.' });
    }

    const finalResume = resumeUrl ? resumeUrl.trim() : student.resumeUrl;
    if (!finalResume) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a resume reference link in your application or complete your profile.'
      });
    }

    const application = await Application.create({
      opportunityId,
      studentId: student._id,
      resumeUrl: finalResume,
      coverLetter: coverLetter ? coverLetter.trim() : ''
    });

    res.status(201).json({ success: true, message: 'Application submitted successfully!', application });
  } catch (error) {
    console.error('Apply Opportunity Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error submitting application' });
  }
};

export const getStudentApplications = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

    const applications = await Application.find({ studentId: student._id })
      .populate({
        path: 'opportunityId',
        select: 'title type location stipend duration status',
        populate: { path: 'companyId', select: 'companyName industry location' }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: applications.length, applications });
  } catch (error) {
    console.error('Get Student Applications Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving applications list' });
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

export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['applied', 'reviewed', 'shortlisted', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid application status (applied, reviewed, shortlisted, accepted, rejected)'
      });
    }

    const company = await Company.findOne({ userId: req.user.id });
    if (!company) return res.status(404).json({ success: false, message: 'Company profile not found' });

    const application = await Application.findById(req.params.id).populate('opportunityId');
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    if (application.opportunityId.companyId.toString() !== company._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to modify applicants for this posting' });
    }

    application.status = status;
    await application.save();
    res.status(200).json({ success: true, message: `Candidate status updated to: ${status}`, application });
  } catch (error) {
    console.error('Update Application Status Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating application status' });
  }
};
