const Opportunity = require('../models/Opportunity');
const Company = require('../models/Company');
const StudentProfile = require('../models/StudentProfile');
const { calculateCompatibility } = require('../utils/matchingEngine');

// @desc    Create a new Job or Internship opportunity
// @route   POST /api/opportunities
// @access  Private (Company only, must be verified)
const createOpportunity = async (req, res) => {
  try {
    // 1. Find company linked to current user
    const company = await Company.findOne({ userId: req.user.id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found. Please complete your profile first.'
      });
    }

    // 2. Reject if company is not verified
    if (company.verificationStatus !== 'verified') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Your company account is pending administrator verification approval.'
      });
    }

    const { title, type, description, requiredSkills, location, stipend, duration } = req.body;

    if (!title || !type || !description || !requiredSkills || requiredSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (title, type, description, requiredSkills)'
      });
    }

    // Parse requiredSkills if it comes as a comma-separated string
    let parsedSkills = requiredSkills;
    if (typeof requiredSkills === 'string') {
      parsedSkills = requiredSkills.split(',').map(s => s.trim()).filter(Boolean);
    }

    const opportunity = await Opportunity.create({
      companyId: company._id,
      title: title.trim(),
      type,
      description: description.trim(),
      requiredSkills: parsedSkills,
      location: location ? location.trim() : 'Remote',
      stipend: stipend ? stipend.trim() : 'Competitive',
      duration: duration ? duration.trim() : ''
    });

    res.status(201).json({
      success: true,
      message: 'Opportunity posted successfully!',
      opportunity
    });
  } catch (error) {
    console.error('Create Opportunity Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error posting opportunity'
    });
  }
};

// @desc    Get all open opportunities with search and filter queries
// @route   GET /api/opportunities
// @access  Private (All authenticated users)
const getOpportunities = async (req, res) => {
  try {
    const query = { status: 'open' };

    // Filter by type: internship vs job
    if (req.query.type) {
      query.type = req.query.type;
    }

    // Filter by required skills (case-insensitive regex match on any of the query skills)
    if (req.query.skills) {
      const skillsQuery = req.query.skills.split(',').map(s => s.trim()).filter(Boolean);
      if (skillsQuery.length > 0) {
        query.requiredSkills = {
          $in: skillsQuery.map(s => new RegExp(`^${s}$`, 'i'))
        };
      }
    }

    // Retrieve and populate company information
    const opportunities = await Opportunity.find(query)
      .populate('companyId', 'companyName industry location logo website')
      .sort({ createdAt: -1 });

    // Calculate compatibility score if logged-in user is a student
    let studentProfile = null;
    if (req.user && req.user.role === 'student') {
      studentProfile = await StudentProfile.findOne({ userId: req.user.id });
    }

    const formattedOpportunities = opportunities.map(opp => {
      const oppObj = opp.toObject();
      if (studentProfile) {
        oppObj.compatibilityScore = calculateCompatibility(studentProfile, opp);
      } else {
        oppObj.compatibilityScore = null;
      }
      return oppObj;
    });

    res.status(200).json({
      success: true,
      count: formattedOpportunities.length,
      opportunities: formattedOpportunities
    });
  } catch (error) {
    console.error('Get Opportunities Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving opportunities'
    });
  }
};

// @desc    Get all opportunities posted by the current logged-in company
// @route   GET /api/opportunities/company
// @access  Private (Company only)
const getCompanyOpportunities = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user.id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found'
      });
    }

    const opportunities = await Opportunity.find({ companyId: company._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      opportunities
    });
  } catch (error) {
    console.error('Get Company Opportunities Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving company postings'
    });
  }
};

// @desc    Update an opportunity posting
// @route   PUT /api/opportunities/:id
// @access  Private (Company only, owner check)
const updateOpportunity = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user.id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found'
      });
    }

    let opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity posting not found'
      });
    }

    // Ownership check: must match the company
    if (opportunity.companyId.toString() !== company._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to modify this posting'
      });
    }

    const { title, type, description, requiredSkills, location, stipend, duration, status } = req.body;

    if (title) opportunity.title = title.trim();
    if (type) opportunity.type = type;
    if (description) opportunity.description = description.trim();
    if (location !== undefined) opportunity.location = location.trim();
    if (stipend !== undefined) opportunity.stipend = stipend.trim();
    if (duration !== undefined) opportunity.duration = duration.trim();
    if (status) opportunity.status = status;

    if (requiredSkills) {
      let parsedSkills = requiredSkills;
      if (typeof requiredSkills === 'string') {
        parsedSkills = requiredSkills.split(',').map(s => s.trim()).filter(Boolean);
      }
      opportunity.requiredSkills = parsedSkills;
    }

    await opportunity.save();

    res.status(200).json({
      success: true,
      message: 'Opportunity posting updated successfully!',
      opportunity
    });
  } catch (error) {
    console.error('Update Opportunity Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error updating opportunity posting'
    });
  }
};

// @desc    Delete/Remove an opportunity posting
// @route   DELETE /api/opportunities/:id
// @access  Private (Company only, owner check)
const deleteOpportunity = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user.id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found'
      });
    }

    let opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity posting not found'
      });
    }

    // Ownership check
    if (opportunity.companyId.toString() !== company._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this posting'
      });
    }

    await Opportunity.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Opportunity posting removed successfully!'
    });
  } catch (error) {
    console.error('Delete Opportunity Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error removing opportunity posting'
    });
  }
};

module.exports = {
  createOpportunity,
  getOpportunities,
  getCompanyOpportunities,
  updateOpportunity,
  deleteOpportunity
};
