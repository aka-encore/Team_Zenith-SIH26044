import Company from '../models/Company.js';
import User from '../models/User.js';

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
    const { companyName, industry, description, website, location, contactPhone, contactEmail } = req.body;
    const profile = await Company.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }

    if (companyName) {
      profile.companyName = companyName.trim();
      await User.findByIdAndUpdate(req.user.id, { name: companyName.trim() });
    }
    if (industry !== undefined) profile.industry = industry.trim();
    if (description !== undefined) profile.description = description.trim();
    if (website !== undefined) profile.website = website.trim();
    if (location !== undefined) profile.location = location.trim();
    if (contactPhone !== undefined) profile.contactPhone = contactPhone.trim();
    if (contactEmail !== undefined) profile.contactEmail = contactEmail.trim();

    await profile.save();
    const updatedProfile = await Company.findOne({ userId: req.user.id }).populate('userId', 'name email role');
    res.status(200).json({ success: true, message: 'Company profile updated successfully!', profile: updatedProfile });
  } catch (error) {
    console.error('Update Company Profile Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating company profile' });
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
