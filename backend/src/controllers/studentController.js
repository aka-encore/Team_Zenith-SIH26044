const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');

// @desc    Get current student profile
// @route   GET /api/students/profile
// @access  Private (Student only)
const getProfile = async (req, res) => {
  try {
    // Find profile and populate name/email from User model reference
    const profile = await StudentProfile.findOne({ userId: req.user.id }).populate('userId', 'name email role');
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Get Profile Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving profile'
    });
  }
};

// @desc    Update current student profile
// @route   PUT /api/students/profile
// @access  Private (Student only)
const updateProfile = async (req, res) => {
  try {
    const { 
      name,
      academicInformation, 
      skills, 
      softSkills, 
      careerInterests, 
      certifications, 
      projects, 
      achievements, 
      resumeUrl 
    } = req.body;

    // Find student profile
    let profile = await StudentProfile.findOne({ userId: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Optional: Allow updating user name in the User model
    if (name) {
      await User.findByIdAndUpdate(req.user.id, { name: name.trim() });
    }

    // Update StudentProfile fields
    if (academicInformation) {
      profile.academicInformation = {
        college: academicInformation.college !== undefined ? academicInformation.college.trim() : profile.academicInformation.college,
        degree: academicInformation.degree !== undefined ? academicInformation.degree.trim() : profile.academicInformation.degree,
        branch: academicInformation.branch !== undefined ? academicInformation.branch.trim() : profile.academicInformation.branch,
        year: academicInformation.year !== undefined ? Number(academicInformation.year) : profile.academicInformation.year,
        cgpa: academicInformation.cgpa !== undefined ? Number(academicInformation.cgpa) : profile.academicInformation.cgpa
      };
    }

    if (skills) profile.skills = Array.isArray(skills) ? skills.map(s => s.trim()) : profile.skills;
    if (softSkills) profile.softSkills = Array.isArray(softSkills) ? softSkills.map(s => s.trim()) : profile.softSkills;
    if (careerInterests) profile.careerInterests = Array.isArray(careerInterests) ? careerInterests.map(c => c.trim()) : profile.careerInterests;
    if (certifications) profile.certifications = Array.isArray(certifications) ? certifications : profile.certifications;
    if (projects) profile.projects = Array.isArray(projects) ? projects : profile.projects;
    if (achievements) profile.achievements = Array.isArray(achievements) ? achievements.map(a => a.trim()) : profile.achievements;
    if (resumeUrl !== undefined) profile.resumeUrl = resumeUrl.trim();

    // Save updated profile
    await profile.save();

    // Retrieve fresh populated profile to return
    const updatedProfile = await StudentProfile.findOne({ userId: req.user.id }).populate('userId', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Update Profile Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error updating student profile'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile
};
