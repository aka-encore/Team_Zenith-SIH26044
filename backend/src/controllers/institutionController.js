import StudentProfile from '../models/StudentProfile.js';
import Application from '../models/Application.js';
import User from '../models/User.js';

export const getAnalytics = async (req, res) => {
  try {
    const institutionUser = await User.findById(req.user.id);
    if (!institutionUser) {
      return res.status(404).json({ success: false, message: 'Institution account not found' });
    }

    const collegeName = institutionUser.name;
    const escaped = collegeName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const students = await StudentProfile.find({
      'academicInformation.college': new RegExp(`^${escaped}$`, 'i')
    }).populate('userId', 'name email role status');

    const emptyMetrics = {
      totalStudents: 0, placedStudents: 0, placementRate: 0,
      averageCgpa: 0, activeApplications: 0, skillFrequency: []
    };

    if (!students.length) {
      return res.status(200).json({ success: true, college: collegeName, metrics: emptyMetrics, studentsList: [] });
    }

    const studentIds = students.map(s => s._id);
    const applications = await Application.find({ studentId: { $in: studentIds } }).populate('opportunityId');

    const placedStudentIds = new Set(
      applications.filter(a => a.status === 'accepted').map(a => a.studentId.toString())
    );
    const placedStudents = placedStudentIds.size;
    const placementRate = Math.round((placedStudents / students.length) * 100);

    const withCgpa = students.filter(s => s.academicInformation?.cgpa > 0);
    const averageCgpa = withCgpa.length
      ? Number((withCgpa.reduce((acc, s) => acc + s.academicInformation.cgpa, 0) / withCgpa.length).toFixed(2))
      : 0;

    const skillCounts = {};
    for (const s of students) {
      for (const skill of s.skills || []) {
        const key = skill.trim();
        if (key) skillCounts[key] = (skillCounts[key] || 0) + 1;
      }
    }
    const skillFrequency = Object.entries(skillCounts)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const studentsList = students.map(s => {
      const studentApps = applications.filter(app => app.studentId.toString() === s._id.toString());
      let placementStatus = 'not_applied';
      if (studentApps.some(app => app.status === 'accepted')) placementStatus = 'placed';
      else if (studentApps.some(app => ['shortlisted', 'reviewed', 'applied'].includes(app.status))) {
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
        totalStudents: students.length,
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
    res.status(500).json({ success: false, message: 'Server error computing institutional analytics statistics' });
  }
};
