import StudentProfile from '../models/StudentProfile.js';
import Application from '../models/Application.js';
import User from '../models/User.js';
import Opportunity from '../models/Opportunity.js';

export const getFacultyDashboardStats = async (req, res) => {
  try {
    const facultyUser = await User.findById(req.user.id);
    if (!facultyUser) {
      return res.status(404).json({ success: false, message: 'Faculty / Institution account not found' });
    }

    const collegeName = facultyUser.name || 'Zenith Institute of Technology & Engineering';

    // 1. Fetch all Student Profiles (linked to real active users)
    const rawStudents = await StudentProfile.find({})
      .populate('userId', 'name email avatarUrl status createdAt')
      .sort({ updatedAt: -1 });

    const allStudents = rawStudents.filter(s => s.userId);
    const totalStudents = allStudents.length;

    // 2. Students with Completed Profiles
    const completedProfiles = allStudents.filter(s => {
      const hasSkills = (s.skills && s.skills.length > 0) || (s.skillsList && s.skillsList.length > 0);
      const hasAcademic = s.academicInformation?.cgpa > 0 || (s.education && s.education.length > 0);
      return Boolean(hasSkills && (hasAcademic || s.bio));
    }).length;

    // 3. Total Unique Skills Recorded & Distribution
    const skillCountMap = {};
    let totalSkillInstances = 0;
    allStudents.forEach(s => {
      const skills = (s.skillsList && s.skillsList.length > 0)
        ? s.skillsList.map(sk => sk.name)
        : (s.skills || []);

      skills.forEach(sk => {
        if (sk) {
          const norm = sk.trim();
          skillCountMap[norm] = (skillCountMap[norm] || 0) + 1;
          totalSkillInstances++;
        }
      });
    });

    const uniqueSkillsCount = Object.keys(skillCountMap).length;
    const topSkills = Object.entries(skillCountMap)
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // 4. Opportunities Stats (Active Internships and Active Jobs)
    const activeJobs = await Opportunity.countDocuments({ type: 'job', status: 'open' });
    const activeInternships = await Opportunity.countDocuments({ type: 'internship', status: 'open' });
    const totalOpportunities = activeJobs + activeInternships;

    // 5. Applications & Placement Metrics
    const allApplications = await Application.find({})
      .populate('opportunityId', 'title type location stipend companyId')
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email avatarUrl' }
      })
      .sort({ updatedAt: -1, createdAt: -1 });

    const placedApplications = allApplications.filter(a => a.status === 'accepted');
    const placedStudentIds = new Set(placedApplications.map(a => a.studentId?._id?.toString()).filter(Boolean));
    const placementCount = placedStudentIds.size;

    const shortlistedStudentIds = new Set(
      allApplications.filter(a => ['shortlisted', 'reviewed'].includes(a.status))
        .map(a => a.studentId?._id?.toString()).filter(Boolean)
    );
    const activeApplicantsCount = shortlistedStudentIds.size;
    const notAppliedCount = Math.max(0, totalStudents - placementCount - activeApplicantsCount);
    const placementRate = totalStudents > 0 ? Math.round((placementCount / totalStudents) * 100) : 0;

    // 6. Recent Student Activity
    const recentActivity = allApplications.slice(0, 6).map(app => {
      const student = app.studentId;
      const u = student?.userId;
      return {
        _id: app._id,
        studentName: u?.name || 'Student Candidate',
        avatarUrl: u?.avatarUrl || null,
        opportunityTitle: app.opportunityId?.title || 'Open Opportunity',
        opportunityType: app.opportunityId?.type || 'job',
        status: app.status,
        date: app.updatedAt || app.createdAt
      };
    });

    res.status(200).json({
      success: true,
      faculty: {
        name: facultyUser.name,
        email: facultyUser.email,
        college: collegeName
      },
      stats: {
        totalStudents,
        completedProfiles,
        uniqueSkillsCount,
        totalSkillInstances,
        activeInternships,
        activeJobs,
        totalOpportunities,
        placementCount,
        placementRate,
        activeApplicantsCount,
        notAppliedCount
      },
      topSkills,
      recentActivity,
      placementBreakdown: {
        placed: placementCount,
        activeApplicants: activeApplicantsCount,
        notApplied: notAppliedCount
      }
    });
  } catch (error) {
    console.error('Get Faculty Dashboard Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving faculty dashboard analytics' });
  }
};

export const getAnalytics = async (req, res) => {
  return getFacultyDashboardStats(req, res);
};

export const getFacultyStudents = async (req, res) => {
  try {
    const facultyUser = await User.findById(req.user.id);
    if (!facultyUser) {
      return res.status(404).json({ success: false, message: 'Faculty / Institution account not found' });
    }

    const { search, department, year, skill, minCgpa } = req.query;

    const query = {};

    if (department && department !== 'all') {
      query.$or = [
        { 'academicInformation.branch': new RegExp(department, 'i') },
        { 'academicInformation.department': new RegExp(department, 'i') },
        { 'education.fieldOfStudy': new RegExp(department, 'i') }
      ];
    }

    if (year && year !== 'all') {
      const yearNum = parseInt(year);
      if (!isNaN(yearNum)) {
        query['academicInformation.year'] = yearNum;
      }
    }

    if (minCgpa) {
      const cgpaVal = parseFloat(minCgpa);
      if (!isNaN(cgpaVal)) {
        query['academicInformation.cgpa'] = { $gte: cgpaVal };
      }
    }

    if (skill && skill.trim()) {
      const skillRegex = new RegExp(skill.trim(), 'i');
      query.$or = [
        ...(query.$or || []),
        { 'skills': skillRegex },
        { 'skillsList.name': skillRegex }
      ];
    }

    const rawStudents = await StudentProfile.find(query)
      .populate('userId', 'name email avatarUrl status createdAt')
      .sort({ updatedAt: -1 });

    const students = rawStudents.filter(s => s.userId);

    const studentIds = students.map(s => s._id);
    const applications = await Application.find({ studentId: { $in: studentIds } }).populate('opportunityId');

    const formatted = students.map(s => {
      const u = s.userId;
      const studentApps = applications.filter(a => a.studentId.toString() === s._id.toString());
      
      let placementStatus = 'not_applied';
      if (studentApps.some(a => a.status === 'accepted')) placementStatus = 'placed';
      else if (studentApps.some(a => ['shortlisted', 'reviewed', 'applied'].includes(a.status))) {
        placementStatus = 'active_applicant';
      }

      const skills = (s.skillsList && s.skillsList.length > 0)
        ? s.skillsList.map(sk => ({ name: sk.name, proficiencyLevel: sk.proficiencyLevel || 'Intermediate' }))
        : (s.skills || []).map(sk => ({ name: sk, proficiencyLevel: 'Intermediate' }));

      // Compute profile completion percentage
      let score = 20; // Base user account
      if (skills.length > 0) score += 20;
      if (s.academicInformation?.cgpa > 0 || (s.education && s.education.length > 0)) score += 20;
      if (s.bio && s.bio.length > 10) score += 15;
      if (s.projects && s.projects.length > 0) score += 15;
      if (s.resumeUrl) score += 10;
      const profileCompletion = Math.min(100, score);

      const college = s.academicInformation?.college || s.education?.[0]?.institutionName || 'Zenith Institute of Technology & Engineering';
      const dept = s.academicInformation?.branch || s.academicInformation?.department || s.education?.[0]?.fieldOfStudy || 'Computer Science';
      const academicYear = s.academicInformation?.year || s.education?.[0]?.currentYear || 3;
      const cgpa = s.academicInformation?.cgpa ?? s.education?.[0]?.grade ?? 8.5;

      return {
        _id: s._id,
        studentId: s._id,
        name: u?.name || 'Candidate Student',
        email: u?.email || 'N/A',
        avatarUrl: u?.avatarUrl || null,
        college,
        department: dept,
        year: academicYear,
        cgpa,
        skills,
        bio: s.bio || '',
        projects: s.projects || [],
        certifications: s.certifications || [],
        resumeUrl: s.resumeUrl || '',
        profileCompletion,
        placementStatus,
        applicationsCount: studentApps.length,
        updatedAt: s.updatedAt || s.createdAt
      };
    });

    // In-memory filter for text search across name and email if provided
    let finalStudents = formatted;
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      finalStudents = formatted.filter(st => 
        (st.name || '').toLowerCase().includes(q) ||
        (st.email || '').toLowerCase().includes(q) ||
        (st.department || '').toLowerCase().includes(q) ||
        (st.skills || []).some(sk => sk.name.toLowerCase().includes(q))
      );
    }

    res.status(200).json({
      success: true,
      count: finalStudents.length,
      students: finalStudents
    });
  } catch (error) {
    console.error('Get Faculty Students Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving students directory' });
  }
};

export const getFacultySkillsAnalytics = async (req, res) => {
  try {
    const facultyUser = await User.findById(req.user.id);
    if (!facultyUser) {
      return res.status(404).json({ success: false, message: 'Faculty / Institution account not found' });
    }

    const rawStudents = await StudentProfile.find({}).populate('userId', 'name email status');
    const students = rawStudents.filter(s => s.userId);
    const opportunities = await Opportunity.find({ status: 'open' });

    const totalStudents = students.length;

    const skillMap = {};
    const proficiencyCounts = {
      Beginner: 0,
      Intermediate: 0,
      Advanced: 0,
      Expert: 0
    };

    const deptMap = {};

    students.forEach(s => {
      const dept = s.academicInformation?.branch || s.academicInformation?.department || s.education?.[0]?.fieldOfStudy || 'Computer Science & Engineering';
      
      if (!deptMap[dept]) {
        deptMap[dept] = {
          department: dept,
          studentCount: 0,
          skills: {}
        };
      }
      deptMap[dept].studentCount++;

      const skillsList = (s.skillsList && s.skillsList.length > 0)
        ? s.skillsList
        : (s.skills || []).map(sk => ({ name: sk, proficiencyLevel: 'Intermediate' }));

      skillsList.forEach(sk => {
        if (!sk || !sk.name) return;
        const norm = sk.name.trim();
        const level = sk.proficiencyLevel || 'Intermediate';

        if (!skillMap[norm]) {
          skillMap[norm] = {
            name: norm,
            count: 0,
            levels: { Beginner: 0, Intermediate: 0, Advanced: 0, Expert: 0 }
          };
        }

        skillMap[norm].count++;
        if (skillMap[norm].levels[level] !== undefined) {
          skillMap[norm].levels[level]++;
        } else {
          skillMap[norm].levels['Intermediate']++;
        }

        if (proficiencyCounts[level] !== undefined) {
          proficiencyCounts[level]++;
        } else {
          proficiencyCounts['Intermediate']++;
        }

        deptMap[dept].skills[norm] = (deptMap[dept].skills[norm] || 0) + 1;
      });
    });

    const mostCommonSkills = Object.values(skillMap)
      .map(item => ({
        name: item.name,
        count: item.count,
        percentage: totalStudents > 0 ? Math.round((item.count / totalStudents) * 100) : 0,
        levels: item.levels
      }))
      .sort((a, b) => b.count - a.count);

    const departmentDistribution = Object.values(deptMap).map(d => {
      const topDeptSkills = Object.entries(d.skills)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      return {
        department: d.department,
        studentCount: d.studentCount,
        topSkills: topDeptSkills
      };
    });

    const marketDemandMap = {};
    opportunities.forEach(opp => {
      (opp.requiredSkills || []).forEach(reqSk => {
        if (reqSk) {
          const norm = reqSk.trim();
          marketDemandMap[norm] = (marketDemandMap[norm] || 0) + 1;
        }
      });
    });

    const skillGaps = Object.entries(marketDemandMap).map(([skillName, demandCount]) => {
      const studentCount = skillMap[skillName]?.count || 0;
      const deficit = Math.max(0, (totalStudents > 0 ? 100 - Math.round((studentCount / totalStudents) * 100) : 100));
      
      let priority = 'Moderate';
      if (deficit >= 70) priority = 'Critical Deficit';
      else if (deficit >= 50) priority = 'High Deficit';
      else priority = 'Low Deficit';

      return {
        skill: skillName,
        demandCount,
        studentCount,
        deficitPercentage: deficit,
        priority
      };
    }).sort((a, b) => b.deficitPercentage - a.deficitPercentage);

    const totalSkillsRecorded = Object.keys(skillMap).length;
    const totalProficiencyCount = Object.values(proficiencyCounts).reduce((a, b) => a + b, 0);

    res.status(200).json({
      success: true,
      totalStudents,
      totalSkillsRecorded,
      mostCommonSkills,
      departmentDistribution,
      proficiencyDistribution: {
        counts: proficiencyCounts,
        total: totalProficiencyCount
      },
      skillGaps
    });
  } catch (error) {
    console.error('Get Faculty Skills Analytics Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error analyzing skills data' });
  }
};

export const getFacultySkillGap = async (req, res) => {
  try {
    const facultyUser = await User.findById(req.user.id);
    if (!facultyUser) {
      return res.status(404).json({ success: false, message: 'Faculty / Institution account not found' });
    }

    const { department, year, skill } = req.query;

    const studentQuery = {};
    if (department && department !== 'all') {
      studentQuery.$or = [
        { 'academicInformation.branch': new RegExp(department, 'i') },
        { 'academicInformation.department': new RegExp(department, 'i') },
        { 'education.fieldOfStudy': new RegExp(department, 'i') }
      ];
    }
    if (year && year !== 'all') {
      const yearNum = parseInt(year);
      if (!isNaN(yearNum)) {
        studentQuery['academicInformation.year'] = yearNum;
      }
    }

    const rawStudents = await StudentProfile.find(studentQuery).populate('userId', 'name email');
    const students = rawStudents.filter(s => s.userId);
    const opportunities = await Opportunity.find({ status: 'open' }).populate('companyId', 'companyName');

    const totalStudents = students.length;
    const totalOpenings = opportunities.length;

    // 1. Build Student Skill Count & Level Map
    const studentSkillMap = {};
    students.forEach(s => {
      const skillsList = (s.skillsList && s.skillsList.length > 0)
        ? s.skillsList
        : (s.skills || []).map(sk => ({ name: sk, proficiencyLevel: 'Intermediate' }));

      skillsList.forEach(sk => {
        if (!sk || !sk.name) return;
        const norm = sk.name.trim();
        const level = sk.proficiencyLevel || 'Intermediate';

        if (!studentSkillMap[norm]) {
          studentSkillMap[norm] = {
            name: norm,
            count: 0,
            levels: { Beginner: 0, Intermediate: 0, Advanced: 0, Expert: 0 }
          };
        }
        studentSkillMap[norm].count++;
        studentSkillMap[norm].levels[level] = (studentSkillMap[norm].levels[level] || 0) + 1;
      });
    });

    // 2. Build Market Demand Map from Real Opportunities
    const marketDemandMap = {};
    opportunities.forEach(opp => {
      (opp.requiredSkills || []).forEach(reqSk => {
        if (reqSk) {
          const norm = reqSk.trim();
          if (!marketDemandMap[norm]) {
            marketDemandMap[norm] = {
              skill: norm,
              demandCount: 0,
              companies: new Set()
            };
          }
          marketDemandMap[norm].demandCount++;
          if (opp.companyId?.companyName) {
            marketDemandMap[norm].companies.add(opp.companyId.companyName);
          }
        }
      });
    });

    // 3. Compute High-Demand Skills & Skill Gaps
    let allDemandSkills = Object.values(marketDemandMap).map(item => {
      const studentData = studentSkillMap[item.skill] || { count: 0, levels: { Beginner: 0, Intermediate: 0, Advanced: 0, Expert: 0 } };
      const studentCount = studentData.count;
      const studentCoverage = totalStudents > 0 ? Math.round((studentCount / totalStudents) * 100) : 0;
      const deficitPercentage = Math.max(0, 100 - studentCoverage);

      let status = 'Sufficient';
      if (studentCount === 0) status = 'Missing';
      else if (deficitPercentage >= 60 || studentData.levels.Beginner >= studentCount * 0.7) status = 'Weak';
      else if (deficitPercentage >= 40) status = 'Moderate Gap';

      return {
        skill: item.skill,
        demandCount: item.demandCount,
        studentCount,
        studentCoverage,
        deficitPercentage,
        status,
        levels: studentData.levels,
        hiringPartners: Array.from(item.companies)
      };
    });

    if (skill && skill.trim()) {
      const q = skill.trim().toLowerCase();
      allDemandSkills = allDemandSkills.filter(item => item.skill.toLowerCase().includes(q));
    }

    // Sort by deficit percentage descending
    allDemandSkills.sort((a, b) => b.deficitPercentage - a.deficitPercentage);

    // 4. Missing Skills (demand exists, but 0 students possess it)
    const missingSkills = allDemandSkills.filter(s => s.studentCount === 0);

    // 5. Weak Skills (low student coverage or majority beginner)
    const weakSkills = allDemandSkills.filter(s => s.status === 'Weak');

    // 6. Recommended Skills & Actions for Curriculum Enhancement
    const recommendedSkills = allDemandSkills
      .filter(s => s.deficitPercentage >= 50)
      .slice(0, 6)
      .map(s => {
        let recommendation = `Integrate hands-on ${s.skill} mini-projects in lab coursework to satisfy ${s.demandCount} hiring openings.`;
        if (s.studentCount === 0) {
          recommendation = `Introduce foundational crash course for ${s.skill} - Currently 0 students are equipped for ${s.demandCount} campus openings.`;
        }
        return {
          skill: s.skill,
          demandCount: s.demandCount,
          deficitPercentage: s.deficitPercentage,
          recommendation,
          projectedPlacementImpact: `+${Math.min(30, s.demandCount * 15)}% Placement Readiness`
        };
      });

    const averageCohortGap = allDemandSkills.length > 0
      ? Math.round(allDemandSkills.reduce((acc, s) => acc + s.deficitPercentage, 0) / allDemandSkills.length)
      : 0;

    res.status(200).json({
      success: true,
      totalStudents,
      totalOpenings,
      averageCohortGap,
      highDemandSkills: allDemandSkills,
      missingSkills,
      weakSkills,
      recommendedSkills
    });
  } catch (error) {
    console.error('Get Faculty Skill Gap Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error computing skill gap analysis' });
  }
};

export const getFacultyOpportunities = async (req, res) => {
  try {
    const facultyUser = await User.findById(req.user.id);
    if (!facultyUser) {
      return res.status(404).json({ success: false, message: 'Faculty / Institution account not found' });
    }

    const { type, search, skill } = req.query;

    const query = { status: 'open' };
    if (type && type !== 'all') {
      query.type = type;
    }
    if (skill && skill.trim()) {
      const skillRegex = new RegExp(skill.trim(), 'i');
      query.requiredSkills = { $in: [skillRegex] };
    }

    const opportunities = await Opportunity.find(query)
      .populate('companyId', 'companyName industry location logo website hrName contactEmail')
      .sort({ createdAt: -1 });

    const oppIds = opportunities.map(o => o._id);
    const applications = await Application.find({ opportunityId: { $in: oppIds } })
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email' }
      });

    const formatted = opportunities.map(opp => {
      const oppApps = applications.filter(a => a.opportunityId.toString() === opp._id.toString());
      
      const comp = opp.companyId;
      const created = opp.createdAt || new Date();
      const deadline = new Date(created.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

      return {
        _id: opp._id,
        title: opp.title,
        type: opp.type,
        description: opp.description || '',
        requiredSkills: opp.requiredSkills || [],
        location: opp.location || 'Remote',
        stipend: opp.stipend || 'Competitive',
        duration: opp.duration || 'Full-time / 6 Months',
        deadline,
        eligibility: {
          minCgpa: 7.0,
          allowedBranches: ['Computer Science', 'Information Technology', 'Electronics & Comm', 'AI & Data Science'],
          passingYears: [2026, 2027]
        },
        company: {
          name: comp?.companyName || 'Enterprise Partner',
          industry: comp?.industry || 'Technology Solutions',
          location: comp?.location || 'Bengaluru / Hybrid',
          logo: comp?.logo || null,
          website: comp?.website || '',
          contactEmail: comp?.contactEmail || ''
        },
        applicantsCount: oppApps.length,
        placedCount: oppApps.filter(a => a.status === 'accepted').length,
        createdAt: opp.createdAt
      };
    });

    let finalOpps = formatted;
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      finalOpps = formatted.filter(o =>
        o.title.toLowerCase().includes(q) ||
        o.company.name.toLowerCase().includes(q) ||
        o.location.toLowerCase().includes(q) ||
        o.requiredSkills.some(sk => sk.toLowerCase().includes(q))
      );
    }

    res.status(200).json({
      success: true,
      count: finalOpps.length,
      opportunities: finalOpps
    });
  } catch (error) {
    console.error('Get Faculty Opportunities Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving faculty opportunities' });
  }
};

export const getFacultyPlacement = async (req, res) => {
  try {
    const facultyUser = await User.findById(req.user.id);
    if (!facultyUser) {
      return res.status(404).json({ success: false, message: 'Faculty / Institution account not found' });
    }

    const { status, search, type } = req.query;

    const allStudents = await StudentProfile.find({}).populate('userId', 'name email avatarUrl');
    const totalStudents = allStudents.length;

    const eligibleStudents = allStudents.filter(s => {
      const cgpa = s.academicInformation?.cgpa ?? s.education?.[0]?.grade ?? 8.0;
      return cgpa >= 7.0;
    });
    const totalEligibleCount = eligibleStudents.length;

    const oppQuery = {};
    if (status && status !== 'all') oppQuery.status = status;
    if (type && type !== 'all') oppQuery.type = type;

    const opportunities = await Opportunity.find(oppQuery)
      .populate('companyId', 'companyName industry location logo website hrName contactEmail')
      .sort({ createdAt: -1 });

    const oppIds = opportunities.map(o => o._id);
    const applications = await Application.find({ opportunityId: { $in: oppIds } })
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email avatarUrl' }
      });

    const allApplications = await Application.find({});
    const totalApplicationsCount = allApplications.length;
    const shortlistedApplications = allApplications.filter(a => ['shortlisted', 'reviewed', 'interview'].includes(a.status));
    const shortlistedCount = new Set(shortlistedApplications.map(a => a.studentId?.toString()).filter(Boolean)).size;
    const acceptedApplications = allApplications.filter(a => ['accepted', 'selected'].includes(a.status));
    const selectedCount = new Set(acceptedApplications.map(a => a.studentId?.toString()).filter(Boolean)).size;

    const activeDrives = opportunities.filter(o => o.status === 'open');
    const upcomingDrives = opportunities.filter(o => o.status === 'open');

    const overallPlacementRate = totalStudents > 0 ? Math.round((selectedCount / totalStudents) * 100) : 0;

    const formattedDrives = opportunities.map(opp => {
      const driveApps = applications.filter(a => a.opportunityId?.toString() === opp._id.toString() || a.opportunityId?._id?.toString() === opp._id.toString());
      const driveShortlisted = driveApps.filter(a => ['shortlisted', 'reviewed', 'interview'].includes(a.status));
      const driveSelected = driveApps.filter(a => ['accepted', 'selected'].includes(a.status));

      const comp = opp.companyId;
      const created = opp.createdAt || new Date();
      const driveDate = new Date(created.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
      const deadline = opp.deadline ? new Date(opp.deadline).toISOString() : new Date(created.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

      // Real eligibility calculation for this specific drive
      const driveEligibleStudents = allStudents.filter(s => {
        const branch = (s.academicInformation?.branch || s.academicInformation?.department || '').toLowerCase().trim();
        const year = (s.academicInformation?.year || s.academicInformation?.yearOfStudy || '').toLowerCase().trim();
        const cgpa = s.academicInformation?.cgpa !== null && s.academicInformation?.cgpa !== undefined ? Number(s.academicInformation.cgpa) : 8.0;

        const isBranchEligible = (!opp.eligibleBranches || opp.eligibleBranches.length === 0) ||
          (branch ? opp.eligibleBranches.some(b => branch.includes(b.toLowerCase().trim()) || b.toLowerCase().trim().includes(branch)) : true);

        const isYearEligible = (!opp.eligibleYears || opp.eligibleYears.length === 0) ||
          (year ? opp.eligibleYears.some(y => year.includes(y.toLowerCase().trim()) || y.toLowerCase().trim().includes(year)) : true);

        const isCgpaEligible = (!opp.minCgpa) || (cgpa >= opp.minCgpa);

        return isBranchEligible && isYearEligible && isCgpaEligible;
      });

      return {
        _id: opp._id,
        role: opp.title,
        type: opp.type,
        status: opp.status || 'open',
        driveDate,
        deadline,
        stipend: opp.stipend || 'Competitive',
        location: opp.location || 'Remote',
        requiredSkills: opp.requiredSkills || [],
        company: {
          name: comp?.companyName || 'Enterprise Partner',
          industry: comp?.industry || 'Technology',
          location: comp?.location || 'Bengaluru',
          logo: comp?.logo || null,
          website: comp?.website || ''
        },
        eligibility: {
          minCgpa: opp.minCgpa || 7.0,
          allowedBranches: opp.eligibleBranches && opp.eligibleBranches.length > 0 ? opp.eligibleBranches : ['Computer Science', 'Information Technology', 'Electronics', 'Data Science'],
          passingYears: opp.eligibleYears && opp.eligibleYears.length > 0 ? opp.eligibleYears : ['2026', '2027']
        },
        metrics: {
          eligibleStudentsCount: driveEligibleStudents.length,
          appliedCount: driveApps.length,
          shortlistedCount: driveShortlisted.length,
          selectedCount: driveSelected.length
        },
        appliedCandidates: driveApps.map(a => ({
          _id: a._id,
          name: a.studentId?.userId?.name || 'Student Candidate',
          email: a.studentId?.userId?.email || 'N/A',
          cgpa: a.studentId?.academicInformation?.cgpa || 8.5,
          department: a.studentId?.academicInformation?.branch || 'Computer Science',
          status: a.status,
          appliedAt: a.createdAt
        }))
      };
    });

    const selectedStudents = applications
      .filter(a => ['accepted', 'selected'].includes(a.status))
      .map(a => ({
        _id: a._id,
        studentName: a.studentId?.userId?.name || 'Placed Candidate',
        email: a.studentId?.userId?.email || 'N/A',
        department: a.studentId?.academicInformation?.branch || a.studentId?.academicInformation?.department || 'Computer Science',
        cgpa: a.studentId?.academicInformation?.cgpa ?? 8.5,
        skills: a.studentId?.skillsList?.map(s => s.name) || a.studentId?.skills || [],
        companyName: a.opportunityId?.companyId?.companyName || 'Corporate Partner',
        role: a.opportunityId?.title || 'Engineer',
        package: a.placementDetails?.package || a.opportunityId?.stipend || 'Competitive Package',
        placedAt: a.placementDetails?.placedAt || a.updatedAt || a.createdAt
      }));

    let finalDrives = formattedDrives;
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      finalDrives = formattedDrives.filter(d =>
        d.role.toLowerCase().includes(q) ||
        d.company.name.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q) ||
        d.requiredSkills.some(sk => sk.toLowerCase().includes(q))
      );
    }

    res.status(200).json({
      success: true,
      stats: {
        activeDrivesCount: activeDrives.length,
        upcomingDrivesCount: upcomingDrives.length,
        totalEligibleStudents: totalEligibleCount,
        totalApplications: totalApplicationsCount,
        shortlistedStudents: shortlistedCount,
        selectedStudents: selectedCount,
        overallPlacementRate
      },
      drives: finalDrives,
      selectedStudents
    });
  } catch (error) {
    console.error('Get Faculty Placement Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving placement records' });
  }
};

export const getFacultyNotifications = async (req, res) => {
  try {
    const facultyUser = await User.findById(req.user.id);
    if (!facultyUser) {
      return res.status(404).json({ success: false, message: 'Faculty / Institution account not found' });
    }

    const readIds = new Set(facultyUser.readNotifications || []);

    const notifications = [];

    // 1. New Job & Internship Postings
    const opportunities = await Opportunity.find({})
      .populate('companyId', 'companyName')
      .sort({ createdAt: -1 })
      .limit(10);

    for (const opp of opportunities) {
      const isJob = opp.type === 'job';
      const notifId = `opp_${opp._id}`;
      notifications.push({
        id: notifId,
        type: isJob ? 'job' : 'internship',
        title: isJob ? 'New Job Drive Announced' : 'New Internship Opening Available',
        message: `${opp.companyId?.companyName || 'Enterprise Partner'} announced a new ${isJob ? 'Job Opening' : 'Internship Program'}: "${opp.title}" requiring ${opp.requiredSkills.slice(0, 3).join(', ')}.`,
        timestamp: opp.createdAt,
        isRead: readIds.has(notifId),
        link: '/faculty/opportunities'
      });
    }

    // 2. Student Application & Placement & Interview Updates
    const applications = await Application.find({})
      .populate('opportunityId', 'title type')
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email' }
      })
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(20);

    for (const app of applications) {
      const studentName = app.studentId?.userId?.name || 'Student Candidate';
      const oppTitle = app.opportunityId?.title || 'Campus Drive';
      const status = (app.status || '').toLowerCase();

      // (a) Placed / Selected update
      if (['accepted', 'selected'].includes(status)) {
        const notifId = `placement_${app._id}`;
        notifications.push({
          id: notifId,
          type: 'placement',
          title: 'Student Placement Offer Secured! 🎉',
          message: `Congratulations! ${studentName} has been officially selected and placed for "${oppTitle}".`,
          timestamp: app.updatedAt || app.createdAt,
          isRead: readIds.has(notifId),
          link: '/faculty/placement'
        });
      }

      // (b) Interview update
      if (status === 'interview' || app.interviewDetails?.scheduledAt) {
        const isCancelled = (app.interviewDetails?.status || '').toLowerCase() === 'cancelled';
        const notifId = isCancelled ? `faculty_int_cancel_${app._id}` : `faculty_int_${app._id}`;
        notifications.push({
          id: notifId,
          type: 'interview',
          title: isCancelled ? 'Candidate Interview Cancelled' : 'Candidate Interview Scheduled 📅',
          message: isCancelled
            ? `Interview session with ${studentName} for "${oppTitle}" was cancelled.`
            : `${studentName} has an upcoming interview scheduled for "${oppTitle}".`,
          timestamp: app.interviewDetails?.scheduledAt || app.updatedAt,
          isRead: readIds.has(notifId),
          link: '/faculty/placement'
        });
      }

      // (c) Shortlisted update
      if (status === 'shortlisted') {
        const notifId = `interview_${app._id}`;
        notifications.push({
          id: notifId,
          type: 'interview',
          title: 'Candidate Shortlisted for Interview',
          message: `${studentName} was shortlisted for technical interview evaluation for "${oppTitle}".`,
          timestamp: app.updatedAt || app.createdAt,
          isRead: readIds.has(notifId),
          link: '/faculty/placement'
        });
      }

      // New Application update
      const notifId = `app_${app._id}`;
      notifications.push({
        id: notifId,
        type: 'application',
        title: 'New Student Application Submitted',
        message: `${studentName} submitted an application for "${oppTitle}".`,
        timestamp: app.createdAt,
        isRead: readIds.has(notifId),
        link: '/faculty/students'
      });
    }

    // Sort by timestamp descending
    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.status(200).json({
      success: true,
      unreadCount,
      totalCount: notifications.length,
      notifications
    });
  } catch (error) {
    console.error('Get Faculty Notifications Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving faculty notifications' });
  }
};

export const markFacultyNotificationAsRead = async (req, res) => {
  try {
    const facultyUser = await User.findById(req.user.id);
    if (!facultyUser) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    const { id } = req.params;
    if (!facultyUser.readNotifications) facultyUser.readNotifications = [];
    if (!facultyUser.readNotifications.includes(id)) {
      facultyUser.readNotifications.push(id);
      await facultyUser.save();
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      readNotifications: facultyUser.readNotifications
    });
  } catch (error) {
    console.error('Mark Notification Read Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating notification status' });
  }
};

export const markAllFacultyNotificationsAsRead = async (req, res) => {
  try {
    const facultyUser = await User.findById(req.user.id);
    if (!facultyUser) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    const { ids } = req.body;
    const existing = new Set(facultyUser.readNotifications || []);
    if (Array.isArray(ids)) {
      ids.forEach(id => existing.add(id));
    }
    facultyUser.readNotifications = Array.from(existing);
    await facultyUser.save();

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      readNotifications: facultyUser.readNotifications
    });
  } catch (error) {
    console.error('Mark All Read Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating notifications' });
  }
};
