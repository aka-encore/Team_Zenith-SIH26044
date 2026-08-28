import Opportunity from '../models/Opportunity.js';
import Company from '../models/Company.js';
import StudentProfile from '../models/StudentProfile.js';
import Application from '../models/Application.js';
import { calculateCompatibility } from '../utils/matchingEngine.js';

const parseSkills = (requiredSkills) =>
  typeof requiredSkills === 'string'
    ? requiredSkills.split(',').map(s => s.trim()).filter(Boolean)
    : requiredSkills;

const companyOfUser = async (userId, res) => {
  const company = await Company.findOne({ userId });
  if (!company) {
    res.status(404).json({ success: false, message: 'Company profile not found' });
    return null;
  }
  return company;
};

export const createOpportunity = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user.id });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found. Please complete your profile first.' });
    }
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

    const opportunity = await Opportunity.create({
      companyId: company._id,
      title: title.trim(),
      type,
      description: description.trim(),
      requiredSkills: parseSkills(requiredSkills),
      location: location ? location.trim() : 'Remote',
      stipend: stipend ? stipend.trim() : 'Competitive',
      duration: duration ? duration.trim() : ''
    });

    res.status(201).json({ success: true, message: 'Opportunity posted successfully!', opportunity });
  } catch (error) {
    console.error('Create Opportunity Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error posting opportunity' });
  }
};

export const getOpportunities = async (req, res) => {
  try {
    const query = { status: 'open' };
    if (req.query.type) query.type = req.query.type;
    if (req.query.skills) {
      const skillsQuery = req.query.skills.split(',').map(s => s.trim()).filter(Boolean);
      if (skillsQuery.length) {
        query.requiredSkills = { $in: skillsQuery.map(s => new RegExp(`^${s}$`, 'i')) };
      }
    }

    const opportunities = await Opportunity.find(query)
      .populate('companyId', 'companyName industry location logo website')
      .sort({ createdAt: -1 });

    const studentProfile = req.user?.role === 'student'
      ? await StudentProfile.findOne({ userId: req.user.id })
      : null;

    const formatted = opportunities.map(opp => {
      const obj = opp.toObject();
      obj.compatibilityScore = studentProfile ? calculateCompatibility(studentProfile, opp) : null;
      return obj;
    });

    res.status(200).json({ success: true, count: formatted.length, opportunities: formatted });
  } catch (error) {
    console.error('Get Opportunities Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving opportunities' });
  }
};

export const getCompanyOpportunities = async (req, res) => {
  try {
    const company = await companyOfUser(req.user.id, res);
    if (!company) return;
    const opportunities = await Opportunity.find({ companyId: company._id }).sort({ createdAt: -1 });
    const oppIds = opportunities.map(o => o._id);

    const applications = await Application.find({ opportunityId: { $in: oppIds } }).select('opportunityId status');
    const countsMap = {};
    applications.forEach(a => {
      const id = a.opportunityId.toString();
      countsMap[id] = (countsMap[id] || 0) + 1;
    });

    const formatted = opportunities.map(opp => {
      const obj = opp.toObject();
      obj.applicantCount = countsMap[opp._id.toString()] || 0;
      return obj;
    });

    res.status(200).json({ success: true, count: formatted.length, opportunities: formatted });
  } catch (error) {
    console.error('Get Company Opportunities Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving company postings' });
  }
};

export const updateOpportunity = async (req, res) => {
  try {
    const company = await companyOfUser(req.user.id, res);
    if (!company) return;

    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity posting not found' });
    }
    if (opportunity.companyId.toString() !== company._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to modify this posting' });
    }

    const { title, type, description, requiredSkills, location, stipend, duration, status } = req.body;
    if (title) opportunity.title = title.trim();
    if (type) opportunity.type = type;
    if (description) opportunity.description = description.trim();
    if (location !== undefined) opportunity.location = location.trim();
    if (stipend !== undefined) opportunity.stipend = stipend.trim();
    if (duration !== undefined) opportunity.duration = duration.trim();
    if (status) opportunity.status = status;
    if (requiredSkills) opportunity.requiredSkills = parseSkills(requiredSkills);

    await opportunity.save();
    res.status(200).json({ success: true, message: 'Opportunity posting updated successfully!', opportunity });
  } catch (error) {
    console.error('Update Opportunity Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating opportunity posting' });
  }
};

export const deleteOpportunity = async (req, res) => {
  try {
    const company = await companyOfUser(req.user.id, res);
    if (!company) return;

    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity posting not found' });
    }
    if (opportunity.companyId.toString() !== company._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this posting' });
    }

    await Opportunity.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Opportunity posting removed successfully!' });
  } catch (error) {
    console.error('Delete Opportunity Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error removing opportunity posting' });
  }
};
