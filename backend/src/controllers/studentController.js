import StudentProfile from '../models/StudentProfile.js';
import User from '../models/User.js';

export const getProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user.id }).populate('userId', 'name email role');
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }
    res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error('Get Profile Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving profile' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const {
      name, academicInformation, skills, softSkills, careerInterests,
      certifications, projects, achievements, resumeUrl
    } = req.body;

    const profile = await StudentProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    if (name) await User.findByIdAndUpdate(req.user.id, { name: name.trim() });

    if (academicInformation) {
      const a = academicInformation;
      const prev = profile.academicInformation;
      profile.academicInformation = {
        college: a.college !== undefined ? a.college.trim() : prev.college,
        degree: a.degree !== undefined ? a.degree.trim() : prev.degree,
        branch: a.branch !== undefined ? a.branch.trim() : prev.branch,
        year: a.year !== undefined ? Number(a.year) : prev.year,
        cgpa: a.cgpa !== undefined ? Number(a.cgpa) : prev.cgpa
      };
    }

    if (skills) profile.skills = Array.isArray(skills) ? skills.map(s => s.trim()) : profile.skills;
    if (softSkills) profile.softSkills = Array.isArray(softSkills) ? softSkills.map(s => s.trim()) : profile.softSkills;
    if (careerInterests) profile.careerInterests = Array.isArray(careerInterests) ? careerInterests.map(c => c.trim()) : profile.careerInterests;
    if (certifications) profile.certifications = Array.isArray(certifications) ? certifications : profile.certifications;
    if (projects) profile.projects = Array.isArray(projects) ? projects : profile.projects;
    if (achievements) profile.achievements = Array.isArray(achievements) ? achievements.map(a => a.trim()) : profile.achievements;
    if (resumeUrl !== undefined) profile.resumeUrl = resumeUrl.trim();

    await profile.save();
    const updatedProfile = await StudentProfile.findOne({ userId: req.user.id }).populate('userId', 'name email role');
    res.status(200).json({ success: true, message: 'Profile updated successfully!', profile: updatedProfile });
  } catch (error) {
    console.error('Update Profile Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating student profile' });
  }
};
