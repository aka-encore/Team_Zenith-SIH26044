import Opportunity, { normalizeRequiredSkills } from '../models/Opportunity.js';
import Company from '../models/Company.js';
import StudentProfile from '../models/StudentProfile.js';
import Application from '../models/Application.js';
import { matchSkills, calculateCompatibility } from '../utils/matchingEngine.js';

const parseSkills = (requiredSkills) => normalizeRequiredSkills(requiredSkills);

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
    const userId = req.user?.id || req.user?._id;
    let companyId = null;

    if (req.user?.role === 'company') {
      const company = await Company.findOne({ userId });
      if (!company) {
        return res.status(404).json({ success: false, message: 'Company profile not found. Please complete your profile first.' });
      }
      if (company.verificationStatus !== 'verified') {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: Your company account is pending administrator verification approval.'
        });
      }
      companyId = company._id;
    } else if (['admin', 'faculty', 'institution'].includes(req.user?.role)) {
      // Faculty/Admin can specify companyId or use a primary partner company
      if (req.body.companyId) {
        companyId = req.body.companyId;
      } else {
        let firstComp = await Company.findOne({});
        if (!firstComp) {
          const compUser = await User.findOne({ role: 'company' });
          if (compUser) {
            firstComp = await Company.create({
              userId: compUser._id,
              companyName: 'Institutional Campus Partner',
              industry: 'Technology',
              location: 'Bengaluru',
              verificationStatus: 'verified'
            });
          }
        }
        companyId = firstComp?._id;
      }
    } else {
      return res.status(403).json({ success: false, message: 'Not authorized to create opportunities' });
    }

    const { 
      title, type, description, requiredSkills, location, stipend, duration,
      deadline, minCgpa, eligibleBranches, eligibleYears, isPlacementDrive, driveName
    } = req.body;

    if (!title || !type || !description || !requiredSkills || requiredSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (title, type, description, requiredSkills)'
      });
    }

    const opportunity = await Opportunity.create({
      companyId,
      title: title.trim(),
      type,
      description: description.trim(),
      requiredSkills: parseSkills(requiredSkills),
      location: location ? location.trim() : 'Remote',
      stipend: stipend ? stipend.trim() : 'Competitive',
      duration: duration ? duration.trim() : '',
      deadline: deadline ? new Date(deadline) : null,
      minCgpa: minCgpa ? Number(minCgpa) : null,
      eligibleBranches: Array.isArray(eligibleBranches) ? eligibleBranches : (typeof eligibleBranches === 'string' && eligibleBranches.trim() ? eligibleBranches.split(',').map(s => s.trim()) : []),
      eligibleYears: Array.isArray(eligibleYears) ? eligibleYears : (typeof eligibleYears === 'string' && eligibleYears.trim() ? eligibleYears.split(',').map(s => s.trim()) : []),
      isPlacementDrive: Boolean(isPlacementDrive),
      driveName: driveName ? driveName.trim() : '',
      status: 'open'
    });

    const populated = await Opportunity.findById(opportunity._id).populate('companyId', 'companyName industry location logo');

    res.status(201).json({
      success: true,
      message: 'Placement Opportunity / Drive created successfully!',
      opportunity: populated
    });
  } catch (error) {
    console.error('Create Opportunity Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error creating opportunity: ' + error.message });
  }
};

export const getOpportunities = async (req, res) => {
  try {
    const query = { status: 'open' };
    if (req.query.type) query.type = req.query.type;
    if (req.query.isPlacementDrive) query.isPlacementDrive = req.query.isPlacementDrive === 'true';
    if (req.query.skills) {
      const skillsQuery = req.query.skills.split(',').map(s => s.trim()).filter(Boolean);
      if (skillsQuery.length) {
        const regexes = skillsQuery.map(s => new RegExp(`^${s}$`, 'i'));
        query.$or = [
          { 'requiredSkills.name': { $in: regexes } },
          { requiredSkills: { $in: regexes } }
        ];
      }
    }

    const opportunities = await Opportunity.find(query)
      .populate('companyId', 'companyName industry location logo website')
      .sort({ createdAt: -1 });

    const userId = req.user?.id || req.user?._id;
    const studentProfile = req.user?.role === 'student' && userId
      ? await StudentProfile.findOne({ userId })
      : null;

    const studentBranch = (studentProfile?.academicInformation?.branch || studentProfile?.academicInformation?.department || '').toLowerCase().trim();
    const studentYear = (studentProfile?.academicInformation?.year || studentProfile?.academicInformation?.yearOfStudy || '').toLowerCase().trim();
    const studentCgpa = studentProfile?.academicInformation?.cgpa !== null && studentProfile?.academicInformation?.cgpa !== undefined
      ? Number(studentProfile.academicInformation.cgpa)
      : null;

    const formatted = opportunities.map(opp => {
      const obj = opp.toObject();
      if (studentProfile) {
        const match = matchSkills(studentProfile, opp);
        obj.matchPercentage = match.matchPercentage;
        obj.matchedSkills = match.matchedSkills;
        obj.missingSkills = match.missingSkills;
        obj.compatibilityScore = match.matchPercentage;

        // Check real eligibility (Department, Year, CGPA, Skills)
        const isBranchEligible = (!opp.eligibleBranches || opp.eligibleBranches.length === 0) ||
          (studentBranch ? opp.eligibleBranches.some(b => studentBranch.includes(b.toLowerCase().trim()) || b.toLowerCase().trim().includes(studentBranch)) : true);

        const isYearEligible = (!opp.eligibleYears || opp.eligibleYears.length === 0) ||
          (studentYear ? opp.eligibleYears.some(y => studentYear.includes(y.toLowerCase().trim()) || y.toLowerCase().trim().includes(studentYear)) : true);

        const isCgpaEligible = (!opp.minCgpa) || (studentCgpa !== null && studentCgpa >= opp.minCgpa);

        const isSkillsEligible = match.matchedSkills.length > 0 || (opp.requiredSkills || []).length === 0;

        obj.isEligible = Boolean(isBranchEligible && isYearEligible && isCgpaEligible);
        obj.eligibility = {
          isBranchEligible,
          isYearEligible,
          isCgpaEligible,
          isSkillsEligible,
          minCgpa: opp.minCgpa,
          eligibleBranches: opp.eligibleBranches || [],
          eligibleYears: opp.eligibleYears || []
        };
      } else {
        obj.matchPercentage = null;
        obj.matchedSkills = [];
        obj.missingSkills = opp.requiredSkills || [];
        obj.compatibilityScore = null;
        obj.isEligible = true;
      }
      return obj;
    });

    res.status(200).json({ success: true, count: formatted.length, opportunities: formatted });
  } catch (error) {
    console.error('Get Opportunities Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving opportunities: ' + error.message });
  }
};

export const getOpportunityMatch = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id)
      .populate('companyId', 'companyName industry location logo website');

    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }

    const studentProfile = await StudentProfile.findOne({ userId: req.user.id });
    if (!studentProfile) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const match = matchSkills(studentProfile, opportunity);

    res.status(200).json({
      success: true,
      opportunityId: opportunity._id,
      opportunityTitle: opportunity.title,
      matchPercentage: match.matchPercentage,
      matchedSkills: match.matchedSkills,
      missingSkills: match.missingSkills,
      totalRequiredSkills: match.totalRequiredSkills,
      studentSkills: match.studentSkills
    });
  } catch (error) {
    console.error('Get Opportunity Match Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error computing opportunity match' });
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

/**
 * POST /api/opportunities/skill-demand-analysis
 * Analyzes real student talent availability for specified required skills or an opportunity.
 * Computes:
 * - Number of matching students
 * - Skill proficiency distribution for each skill
 * - Average match percentage
 */
export const getSkillDemandAnalysis = async (req, res) => {
  try {
    const { opportunityId, requiredSkills: inputSkills } = req.body;

    let skillsToAnalyze = [];

    if (opportunityId) {
      const opp = await Opportunity.findById(opportunityId);
      if (opp && Array.isArray(opp.requiredSkills)) {
        skillsToAnalyze = opp.requiredSkills;
      }
    }

    if (inputSkills && (!skillsToAnalyze || skillsToAnalyze.length === 0)) {
      skillsToAnalyze = parseSkills(inputSkills);
    }

    // Clean and normalize required skills list
    const cleanSkills = Array.from(new Set(
      (skillsToAnalyze || []).map(s => (typeof s === 'string' ? s : s?.name || '').trim()).filter(Boolean)
    ));

    // Fetch real students from MongoDB
    const rawStudents = await StudentProfile.find({})
      .populate('userId', 'name email avatarUrl status createdAt')
      .sort({ updatedAt: -1 });

    const students = rawStudents.filter(s => s.userId);
    const totalStudentsInCohort = students.length;

    if (cleanSkills.length === 0 || totalStudentsInCohort === 0) {
      return res.status(200).json({
        success: true,
        requiredSkills: cleanSkills,
        totalStudentsCount: totalStudentsInCohort,
        matchingStudentsCount: 0,
        averageMatchPercentage: 0,
        proficiencyDistribution: {},
        matchingStudents: [],
        message: 'No matching students available yet.'
      });
    }

    // Calculate match results for each student using existing matchingEngine
    const studentMatchResults = [];
    let sumMatchPercentage = 0;

    // Build proficiency distribution map for each required skill
    const proficiencyDistribution = {};
    cleanSkills.forEach(sk => {
      proficiencyDistribution[sk] = {
        Beginner: 0,
        Intermediate: 0,
        Advanced: 0,
        Expert: 0,
        totalWithSkill: 0
      };
    });

    students.forEach(student => {
      const match = matchSkills(student, { requiredSkills: cleanSkills });
      sumMatchPercentage += match.matchPercentage;

      // Extract proficiencies for matched skills
      const studentSkillsList = Array.isArray(student.skillsList) && student.skillsList.length > 0
        ? student.skillsList
        : (student.skills || []).map(s => (typeof s === 'string' ? { name: s, proficiencyLevel: 'Intermediate' } : s));

      const profMap = {};
      studentSkillsList.forEach(item => {
        if (item && item.name) {
          profMap[item.name.toLowerCase().trim()] = item.proficiencyLevel || 'Intermediate';
        }
      });

      // Update distribution
      cleanSkills.forEach(reqSk => {
        const norm = reqSk.toLowerCase().trim();
        if (profMap[norm]) {
          const level = profMap[norm];
          if (proficiencyDistribution[reqSk][level] !== undefined) {
            proficiencyDistribution[reqSk][level]++;
          } else {
            proficiencyDistribution[reqSk]['Intermediate']++;
          }
          proficiencyDistribution[reqSk].totalWithSkill++;
        }
      });

      // Include in matching list if matchPercentage > 0
      if (match.matchPercentage > 0) {
        studentMatchResults.push({
          studentId: student._id,
          userId: student.userId?._id,
          name: student.userId?.name || 'Student Candidate',
          email: student.userId?.email || '',
          avatarUrl: student.userId?.avatarUrl || null,
          department: student.academicInformation?.branch || student.academicInformation?.department || 'Engineering',
          year: student.academicInformation?.year || student.academicInformation?.yearOfStudy || '',
          cgpa: student.academicInformation?.cgpa,
          matchPercentage: match.matchPercentage,
          matchedSkills: match.matchedSkills,
          missingSkills: match.missingSkills
        });
      }
    });

    // Sort matching students by highest match percentage descending
    studentMatchResults.sort((a, b) => b.matchPercentage - a.matchPercentage);

    const matchingStudentsCount = studentMatchResults.length;
    const averageMatchPercentage = matchingStudentsCount > 0
      ? Math.round(studentMatchResults.reduce((acc, s) => acc + s.matchPercentage, 0) / matchingStudentsCount)
      : (totalStudentsInCohort > 0 ? Math.round(sumMatchPercentage / totalStudentsInCohort) : 0);

    res.status(200).json({
      success: true,
      requiredSkills: cleanSkills,
      totalStudentsCount: totalStudentsInCohort,
      matchingStudentsCount,
      averageMatchPercentage,
      proficiencyDistribution,
      matchingStudents: studentMatchResults,
      message: matchingStudentsCount === 0 ? 'No matching students available yet.' : 'Analysis computed successfully.'
    });
  } catch (error) {
    console.error('Skill Demand Analysis Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error analyzing skill demand: ' + error.message });
  }
};
