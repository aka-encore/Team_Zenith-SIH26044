const Application = require('../models/Application');
const StudentProfile = require('../models/StudentProfile');
const Opportunity = require('../models/Opportunity');
const Company = require('../models/Company');
const { calculateCompatibility } = require('../utils/matchingEngine');

// @desc    Apply for an internship or job posting
// @route   POST /api/applications
// @access  Private (Student only)
const applyOpportunity = async (req, res) => {
  try {
    const { opportunityId, coverLetter, resumeUrl } = req.body;

    if (!opportunityId) {
      return res.status(400).json({
        success: false,
        message: 'Opportunity ID is required'
      });
    }

    // 1. Find StudentProfile linked to user
    const student = await StudentProfile.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found. Please complete your registration details.'
      });
    }

    // 2. Fetch Opportunity to ensure it exists and is open
    const opp = await Opportunity.findById(opportunityId);
    if (!opp) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity posting not found'
      });
    }

    if (opp.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'This opportunity is closed for applications.'
      });
    }

    // 3. Check for existing application
    const alreadyApplied = await Application.findOne({
      studentId: student._id,
      opportunityId
    });

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this opening.'
      });
    }

    // 4. Resolve Resume URL (custom body parameter or default from profile)
    const finalResume = resumeUrl ? resumeUrl.trim() : student.resumeUrl;
    if (!finalResume) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a resume reference link in your application or complete your profile.'
      });
    }

    // 5. Create application
    const application = await Application.create({
      opportunityId,
      studentId: student._id,
      resumeUrl: finalResume,
      coverLetter: coverLetter ? coverLetter.trim() : ''
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      application
    });
  } catch (error) {
    console.error('Apply Opportunity Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error submitting application'
    });
  }
};

// @desc    Get all applications submitted by the current student
// @route   GET /api/applications/student
// @access  Private (Student only)
const getStudentApplications = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Find applications and populate opportunity details along with nested company name
    const applications = await Application.find({ studentId: student._id })
      .populate({
        path: 'opportunityId',
        select: 'title type location stipend duration status',
        populate: {
          path: 'companyId',
          select: 'companyName industry location'
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error('Get Student Applications Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving applications list'
    });
  }
};

// @desc    Get all applicants for a specific opportunity (Company view)
// @route   GET /api/applications/opportunity/:opportunityId
// @access  Private (Company only, owner check)
const getOpportunityApplicants = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user.id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found'
      });
    }

    const opp = await Opportunity.findById(req.params.opportunityId);
    if (!opp) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity posting not found'
      });
    }

    // Validate ownership
    if (opp.companyId.toString() !== company._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view applicants for this posting'
      });
    }

    // Retrieve applications and populate student academic stats and user details
    const applications = await Application.find({ opportunityId: req.params.opportunityId })
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      });

    // Calculate compatibility score and sort descending
    const formattedApplications = applications.map(app => {
      const appObj = app.toObject();
      if (appObj.studentId) {
        appObj.compatibilityScore = calculateCompatibility(appObj.studentId, opp);
      } else {
        appObj.compatibilityScore = 0;
      }
      return appObj;
    });

    formattedApplications.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    res.status(200).json({
      success: true,
      count: formattedApplications.length,
      applications: formattedApplications
    });
  } catch (error) {
    console.error('Get Opportunity Applicants Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving applicants list'
    });
  }
};

// @desc    Update application status (reviewed, shortlisted, accepted, rejected)
// @route   PUT /api/applications/:id/status
// @access  Private (Company only, owner check)
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['applied', 'reviewed', 'shortlisted', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid application status (applied, reviewed, shortlisted, accepted, rejected)'
      });
    }

    const company = await Company.findOne({ userId: req.user.id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found'
      });
    }

    // Find application and populate opportunity details to check ownership
    const application = await Application.findById(req.params.id).populate('opportunityId');
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Validate ownership
    if (application.opportunityId.companyId.toString() !== company._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to modify applicants for this posting'
      });
    }

    application.status = status;
    await application.save();

    res.status(200).json({
      success: true,
      message: `Candidate status updated to: ${status}`,
      application
    });
  } catch (error) {
    console.error('Update Application Status Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error updating application status'
    });
  }
};

module.exports = {
  applyOpportunity,
  getStudentApplications,
  getOpportunityApplicants,
  updateApplicationStatus
};
