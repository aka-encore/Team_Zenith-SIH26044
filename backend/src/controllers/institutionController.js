const StudentProfile = require('../models/StudentProfile');
const Application = require('../models/Application');
const User = require('../models/User');

// @desc    Get Institutional Placement & Skill Analytics
// @route   GET /api/institutions/analytics
// @access  Private (Institution only)
const getAnalytics = async (req, res) => {
  try {
    // 1. Get current logged-in institution user details
    const institutionUser = await User.findById(req.user.id);
    if (!institutionUser) {
      return res.status(404).json({
        success: false,
        message: 'Institution account not found'
      });
    }

    const collegeName = institutionUser.name;

    // 2. Fetch all student profiles matching this college name
    const students = await StudentProfile.find({
      'academicInformation.college': new RegExp(`^${collegeName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i')
    }).populate('userId', 'name email role status');

    const totalStudents = students.length;

    if (totalStudents === 0) {
      return res.status(200).json({
        success: true,
        college: collegeName,
        metrics: {
          totalStudents: 0,
          placedStudents: 0,
          placementRate: 0,
          averageCgpa: 0,
          activeApplications: 0,
          skillFrequency: []
        },
        studentsList: []
      });
    }

    const studentIds = students.map(s => s._id);

    // 3. Fetch all applications submitted by these students
    const applications = await Application.find({
      studentId: { $in: studentIds }
    }).populate('opportunityId');

    // 4. Compute analytics metrics
    // Calculate placed students count (unique students with 'accepted' status applications)
    const placedStudentIds = new Set();
    applications.forEach(app => {
      if (app.status === 'accepted') {
        placedStudentIds.add(app.studentId.toString());
      }
    });

    const placedStudents = placedStudentIds.size;
    const placementRate = Math.round((placedStudents / totalStudents) * 100);

    // Calculate average CGPA
    const validCgpaStudents = students.filter(s => s.academicInformation?.cgpa > 0);
    const sumCgpa = validCgpaStudents.reduce((acc, curr) => acc + curr.academicInformation.cgpa, 0);
    const averageCgpa = validCgpaStudents.length > 0 ? Number((sumCgpa / validCgpaStudents.length).toFixed(2)) : 0;

    // Calculate skill distributions
    const skillCounts = {};
    students.forEach(s => {
      if (s.skills && s.skills.length > 0) {
        s.skills.forEach(skill => {
          const formattedSkill = skill.trim();
          if (formattedSkill) {
            skillCounts[formattedSkill] = (skillCounts[formattedSkill] || 0) + 1;
          }
        });
      }
    });

    // Format skill frequency array and sort by count descending
    const skillFrequency = Object.keys(skillCounts).map(skill => ({
      skill,
      count: skillCounts[skill]
    })).sort((a, b) => b.count - a.count).slice(0, 8); // Top 8 skills

    // 5. Build students detailed list with status labels
    const studentsList = students.map(s => {
      const studentApps = applications.filter(app => app.studentId.toString() === s._id.toString());
      
      let placementStatus = 'not_applied';
      if (studentApps.some(app => app.status === 'accepted')) {
        placementStatus = 'placed';
      } else if (studentApps.some(app => ['shortlisted', 'reviewed', 'applied'].includes(app.status))) {
        placementStatus = 'active_applicant';
      }

      return {
        _id: s._id,
        name: s.userId?.name || 'Candidate',
        email: s.userId?.email || 'N/A',
        cgpa: s.academicInformation?.cgpa || 0,
        year: s.academicInformation?.year || 1,
        skills: s.skills || [],
        placementStatus,
        applicationsCount: studentApps.length
      };
    });

    res.status(200).json({
      success: true,
      college: collegeName,
      metrics: {
        totalStudents,
        placedStudents,
        placementRate,
        averageCgpa,
        activeApplications: applications.length,
        skillFrequency
      },
      studentsList
    });
  } catch (error) {
    console.error('Get Institution Analytics Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error computing institutional analytics statistics'
    });
  }
};

module.exports = {
  getAnalytics
};
