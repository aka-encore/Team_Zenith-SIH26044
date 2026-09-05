import Company from '../models/Company.js';
import User from '../models/User.js';
import Opportunity from '../models/Opportunity.js';
import Application from '../models/Application.js';
import StudentProfile from '../models/StudentProfile.js';
import AssessmentResult from '../models/AssessmentResult.js';
import { matchSkills, calculateDetailedCompatibility } from '../utils/matchingEngine.js';

export const getProfile = async (req, res) => {
  try {
    let profile = await Company.findOne({ userId: req.user.id }).populate('userId', 'name email role');
    if (!profile) {
      profile = await Company.create({
        userId: req.user.id,
        companyName: req.user.name || 'Company Name',
        industry: 'Technology',
        description: '',
        website: '',
        location: '',
        hrName: req.user.name || 'HR Team',
        contactEmail: req.user.email || '',
        contactPhone: '',
        companySize: '11-50 employees',
        foundedYear: new Date().getFullYear().toString()
      });
      profile = await Company.findById(profile._id).populate('userId', 'name email role');
    }
    res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error('Get Company Profile Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving company profile' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { 
      companyName, logoUrl, industry, description, website, location, 
      hrName, contactPhone, contactEmail, hrEmail, companySize, foundedYear,
      technologiesUsed, hiringAreas
    } = req.body;
    
    let profile = await Company.findOne({ userId: req.user.id });
    if (!profile) {
      profile = new Company({ userId: req.user.id });
    }

    if (companyName && companyName.trim()) {
      profile.companyName = companyName.trim();
      await User.findByIdAndUpdate(req.user.id, { name: companyName.trim() });
    }
    if (logoUrl !== undefined) profile.logoUrl = (logoUrl || '').trim();
    if (industry !== undefined) profile.industry = (industry || '').trim();
    if (description !== undefined) profile.description = (description || '').trim();
    if (website !== undefined) profile.website = (website || '').trim();
    if (location !== undefined) profile.location = (location || '').trim();
    if (hrName !== undefined) profile.hrName = (hrName || '').trim();
    if (contactPhone !== undefined) profile.contactPhone = (contactPhone || '').trim();
    if (contactEmail !== undefined || hrEmail !== undefined) {
      profile.contactEmail = (contactEmail || hrEmail || '').trim();
    }
    if (companySize !== undefined) profile.companySize = (companySize || '').trim();
    if (foundedYear !== undefined) profile.foundedYear = foundedYear ? foundedYear.toString().trim() : '';
    if (technologiesUsed !== undefined) {
      profile.technologiesUsed = Array.isArray(technologiesUsed) 
        ? technologiesUsed.map(t => typeof t === 'string' ? t.trim() : t).filter(Boolean)
        : (typeof technologiesUsed === 'string' ? technologiesUsed.split(',').map(t => t.trim()).filter(Boolean) : []);
    }
    if (hiringAreas !== undefined) {
      profile.hiringAreas = Array.isArray(hiringAreas)
        ? hiringAreas.map(a => typeof a === 'string' ? a.trim() : a).filter(Boolean)
        : (typeof hiringAreas === 'string' ? hiringAreas.split(',').map(a => a.trim()).filter(Boolean) : []);
    }

    await profile.save();
    const updatedProfile = await Company.findOne({ userId: req.user.id }).populate('userId', 'name email role');
    res.status(200).json({ success: true, message: 'Company profile updated successfully!', profile: updatedProfile });
  } catch (error) {
    console.error('Update Company Profile Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating company profile: ' + error.message });
  }
};

export const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please provide an image file for company logo' });
    }
    const logoUrl = `/uploads/profiles/${req.file.filename}`;
    const profile = await Company.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }
    profile.logoUrl = logoUrl;
    await profile.save();
    res.status(200).json({ success: true, message: 'Company logo uploaded successfully!', logoUrl, profile });
  } catch (error) {
    console.error('Upload Company Logo Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error uploading company logo' });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user.id });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }

    // 1. Fetch all opportunities belonging strictly to this company
    const opportunities = await Opportunity.find({ companyId: company._id }).sort({ createdAt: -1 });
    const oppIds = opportunities.map(o => o._id);

    // 2. Fetch all applications belonging strictly to this company's opportunities
    const applications = await Application.find({ opportunityId: { $in: oppIds } })
      .populate({
        path: 'opportunityId',
        select: 'title type status location stipend duration requiredSkills'
      })
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'name email avatarUrl'
        },
        select: 'academicInformation skillsList skills resumeUrl'
      })
      .sort({ createdAt: -1 });

    // 3. Compute Overview Metrics
    const activeJobs = opportunities.filter(o => o.type === 'job' && o.status === 'open').length;
    const activeInternships = opportunities.filter(o => o.type === 'internship' && o.status === 'open').length;
    const totalApplicants = applications.length;
    const shortlistedCount = applications.filter(a => (a.status || '').toLowerCase() === 'shortlisted').length;

    // 4. Map application counts per opportunity
    const appCountByOpp = {};
    applications.forEach(app => {
      const oppId = app.opportunityId?._id?.toString() || app.opportunityId?.toString();
      if (oppId) {
        appCountByOpp[oppId] = (appCountByOpp[oppId] || 0) + 1;
      }
    });

    const formattedOpportunities = opportunities.map(opp => ({
      _id: opp._id,
      title: opp.title,
      type: opp.type,
      status: opp.status,
      location: opp.location,
      stipend: opp.stipend,
      duration: opp.duration,
      requiredSkills: opp.requiredSkills || [],
      applicantCount: appCountByOpp[opp._id.toString()] || 0,
      createdAt: opp.createdAt
    }));

    // 5. Recent applicants (latest 6)
    const recentApplicants = applications.slice(0, 6).map(app => {
      const student = app.studentId;
      const user = student?.userId;
      const skills = (student?.skillsList && student.skillsList.length > 0)
        ? student.skillsList.map(s => s.name)
        : (student?.skills || []);

      return {
        _id: app._id,
        studentName: user?.name || 'Applicant',
        studentEmail: user?.email || '',
        avatarUrl: user?.avatarUrl || null,
        college: student?.academicInformation?.college || student?.academicInformation?.degree || 'Student',
        degree: student?.academicInformation?.degree || '',
        branch: student?.academicInformation?.branch || '',
        cgpa: student?.academicInformation?.cgpa ?? null,
        skills: skills.slice(0, 5),
        positionTitle: app.opportunityId?.title || 'Applied Position',
        positionType: app.opportunityId?.type || 'job',
        status: app.status || 'applied',
        appliedAt: app.createdAt,
        resumeUrl: app.resumeUrl || student?.resumeUrl || ''
      };
    });

    // 6. Upcoming Interviews (candidates in 'shortlisted' or 'accepted' state)
    const interviewApplicants = applications.filter(a => ['shortlisted', 'accepted'].includes((a.status || '').toLowerCase()));
    const upcomingInterviews = interviewApplicants.map(app => {
      const student = app.studentId;
      const user = student?.userId;
      const scheduledDate = new Date(app.updatedAt || app.createdAt);
      scheduledDate.setDate(scheduledDate.getDate() + 2);

      return {
        _id: app._id,
        studentName: user?.name || 'Candidate',
        studentEmail: user?.email || '',
        avatarUrl: user?.avatarUrl || null,
        positionTitle: app.opportunityId?.title || 'Role',
        positionType: app.opportunityId?.type || 'job',
        date: scheduledDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: '11:00 AM - 12:00 PM IST',
        mode: 'Virtual Video (Google Meet)',
        meetingLink: 'https://meet.google.com',
        round: app.status === 'accepted' ? 'Offer Extended & Briefing' : 'Technical Evaluation Round 1',
        status: app.status === 'accepted' ? 'Offer Extended' : 'Interview Scheduled'
      };
    });

    // 7. Hiring Insights
    const skillMap = {};
    applications.forEach(app => {
      const student = app.studentId;
      const skills = (student?.skillsList && student.skillsList.length > 0)
        ? student.skillsList.map(s => s.name)
        : (student?.skills || []);
      skills.forEach(sk => {
        if (sk) {
          const norm = sk.trim();
          skillMap[norm] = (skillMap[norm] || 0) + 1;
        }
      });
    });

    const commonSkills = Object.entries(skillMap)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const stageBreakdown = {
      applied: applications.filter(a => a.status === 'applied').length,
      reviewed: applications.filter(a => a.status === 'reviewed').length,
      shortlisted: applications.filter(a => a.status === 'shortlisted').length,
      accepted: applications.filter(a => a.status === 'accepted').length,
      rejected: applications.filter(a => a.status === 'rejected').length
    };

    res.status(200).json({
      success: true,
      company: {
        _id: company._id,
        companyName: company.companyName,
        industry: company.industry,
        location: company.location,
        verificationStatus: company.verificationStatus
      },
      stats: {
        activeJobs,
        activeInternships,
        totalApplicants,
        shortlistedCount,
        interviewCount: upcomingInterviews.length
      },
      opportunities: formattedOpportunities,
      recentApplicants,
      upcomingInterviews,
      insights: {
        commonSkills,
        stageBreakdown,
        applicantsByOpportunity: formattedOpportunities.map(o => ({
          opportunityId: o._id,
          title: o.title,
          type: o.type,
          count: o.applicantCount
        }))
      }
    });

  } catch (error) {
    console.error('Get Company Dashboard Stats Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving dashboard stats' });
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

export const searchStudents = async (req, res) => {
  try {
    const { 
      skill, skills, department, branch, year, minCgpa, 
      skillLevel, skillProficiency, location, careerInterests, 
      certifications, experience, sortBy, search, opportunityId 
    } = req.query;

    const query = {};

    // 1. Skills filter (handles skill or skills query, comma-separated or single)
    const skillParam = skill || skills;
    if (skillParam && skillParam.trim()) {
      const skillTokens = skillParam.split(',').map(s => s.trim()).filter(Boolean);
      if (skillTokens.length > 0) {
        const regexes = skillTokens.map(s => new RegExp(s, 'i'));
        query.$and = query.$and || [];
        query.$and.push({
          $or: [
            { skills: { $in: regexes } },
            { 'skillsList.name': { $in: regexes } }
          ]
        });
      }
    }

    // 2. Department / Branch filter
    const deptParam = department || branch;
    if (deptParam && deptParam.trim() && deptParam !== 'all') {
      const deptRegex = new RegExp(deptParam.trim(), 'i');
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { 'academicInformation.branch': deptRegex },
          { 'academicInformation.department': deptRegex },
          { 'education.fieldOfStudy': deptRegex }
        ]
      });
    }

    // 3. Year filter
    if (year && year.trim() && year !== 'all') {
      const yearRegex = new RegExp(year.trim(), 'i');
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { 'academicInformation.year': yearRegex },
          { 'academicInformation.yearOfStudy': yearRegex },
          { 'academicInformation.expectedGraduationYear': year.trim() },
          { 'education.graduationYear': year.trim() }
        ]
      });
    }

    // 4. CGPA filter
    if (minCgpa && !isNaN(Number(minCgpa))) {
      const cgpaVal = Number(minCgpa);
      query['academicInformation.cgpa'] = { $gte: cgpaVal };
    }

    // 5. Skill proficiency level filter
    const profParam = skillLevel || skillProficiency;
    if (profParam && profParam.trim() && profParam !== 'all') {
      const profRegex = new RegExp(profParam.trim(), 'i');
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { 'skillsList.proficiency': profRegex },
          { 'skillsList.proficiencyLevel': profRegex }
        ]
      });
    }

    // 6. Location filter
    if (location && location.trim() && location !== 'all') {
      const locRegex = new RegExp(location.trim(), 'i');
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { 'academicInformation.college': locRegex },
          { bio: locRegex }
        ]
      });
    }

    // 7. Career interests filter
    if (careerInterests && careerInterests.trim() && careerInterests !== 'all') {
      const interestRegex = new RegExp(careerInterests.trim(), 'i');
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { careerInterests: interestRegex },
          { bio: interestRegex }
        ]
      });
    }

    // 8. Certifications filter
    if (certifications && certifications.trim() && certifications !== 'all') {
      const certRegex = new RegExp(certifications.trim(), 'i');
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { 'certifications.title': certRegex },
          { 'certifications.issuer': certRegex }
        ]
      });
    }

    // 9. Fetch student profiles with populated user details
    let studentProfiles = await StudentProfile.find(query)
      .populate('userId', 'name email phone avatarUrl status createdAt')
      .sort({ overallScore: -1, 'academicInformation.cgpa': -1, createdAt: -1 });

    studentProfiles = studentProfiles.filter(sp => sp.userId && sp.userId.status !== 'inactive');

    // Experience filter (min projects/certifications)
    if (experience && experience.trim() && experience !== 'all') {
      const minExpCount = experience === 'high' ? 3 : 1;
      studentProfiles = studentProfiles.filter(sp => 
        (sp.projects?.length || 0) + (sp.certifications?.length || 0) >= minExpCount
      );
    }

    // Free text search across Name, College, Branch, Skills, Bio
    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      studentProfiles = studentProfiles.filter(sp => {
        const name = (sp.userId?.name || '').toLowerCase();
        const email = (sp.userId?.email || '').toLowerCase();
        const college = (sp.academicInformation?.college || '').toLowerCase();
        const branch = (sp.academicInformation?.branch || sp.academicInformation?.department || '').toLowerCase();
        const skills = (sp.skillsList?.map(sk => sk.name.toLowerCase()) || []).concat(sp.skills?.map(sk => sk.toLowerCase()) || []);
        const bio = (sp.bio || '').toLowerCase();
        return name.includes(s) || email.includes(s) || college.includes(s) || branch.includes(s) || skills.some(sk => sk.includes(s)) || bio.includes(s);
      });
    }

    const company = await Company.findOne({ userId: req.user.id });
    const opportunities = company ? await Opportunity.find({ companyId: company._id, status: 'open' }).select('_id title type requiredSkills minCgpa eligibleBranches') : [];

    // Target opportunity for matching
    let targetOpportunity = null;
    const targetOppId = opportunityId || req.query.opportunityId;
    if (targetOppId && targetOppId !== 'all') {
      targetOpportunity = await Opportunity.findById(targetOppId);
    }

    // Fetch existing applications for this target opportunity
    const appStatusMap = new Map();
    if (targetOpportunity) {
      const existingApps = await Application.find({ opportunityId: targetOpportunity._id });
      existingApps.forEach(app => {
        appStatusMap.set(app.studentId.toString(), app.status || 'applied');
      });
    }

    // Format safe response for corporate recruiter view with matching engine calculation
    const formatted = studentProfiles.map(sp => {
      const u = sp.userId;
      const acad = sp.academicInformation || {};
      const degree = acad.degree || acad.course || 'B.Tech';
      const branchName = acad.branch || acad.department || 'Engineering';
      const college = acad.college || 'Zenith University Partner';
      const yearStr = acad.year || acad.yearOfStudy || acad.expectedGraduationYear || '3rd Year';
      const cgpa = acad.cgpa !== null && acad.cgpa !== undefined ? Number(acad.cgpa) : null;

      const skills = (sp.skillsList && sp.skillsList.length > 0)
        ? sp.skillsList.map(s => ({
            name: s.name,
            proficiency: s.proficiency || s.proficiencyLevel || 'Intermediate',
            verified: s.verified || false
          }))
        : (sp.skills || []).map(s => ({
            name: s,
            proficiency: 'Intermediate',
            verified: false
          }));

      let compatibility = null;
      if (targetOpportunity) {
        compatibility = calculateDetailedCompatibility(sp, targetOpportunity);
      } else if (skillParam && skillParam.trim()) {
        const matchSimple = matchSkills(sp, [skillParam.trim()]);
        compatibility = {
          compatibilityScore: matchSimple.matchPercentage,
          compatibilityPercentage: matchSimple.matchPercentage,
          matchedSkills: matchSimple.matchedSkills,
          missingSkills: matchSimple.missingSkills,
          isEligible: true,
          eligibilityReasons: [],
          breakdown: { skillScore: matchSimple.matchPercentage, eligibilityScore: 100, careerInterestScore: 70 }
        };
      }

      const currentAppStatus = appStatusMap.get(sp._id.toString()) || 'none';
      const experienceScore = (sp.projects?.length || 0) * 2 + (sp.certifications?.length || 0);

      return {
        _id: sp._id,
        studentId: sp._id,
        name: u?.name || 'Candidate',
        email: u?.email || '',
        phone: sp.phone || u?.phone || '',
        avatarUrl: u?.avatarUrl || null,
        college,
        degree,
        branch: branchName,
        department: branchName,
        year: yearStr,
        cgpa,
        education: [degree, branchName, college].filter(Boolean).join(' • '),
        skills,
        keySkills: skills.map(s => s.name),
        bio: sp.bio || '',
        overallScore: sp.overallScore || 85,
        projects: sp.projects || [],
        certifications: sp.certifications || [],
        achievements: sp.achievements || [],
        careerInterests: sp.careerInterests || [],
        socialLinks: sp.socialLinks || {},
        resumeUrl: sp.resumeUrl || '',
        resumeName: sp.resumeName || '',
        applicationStatus: currentAppStatus,
        experienceScore,
        compatibilityScore: compatibility ? compatibility.compatibilityScore : null,
        compatibilityPercentage: compatibility ? compatibility.compatibilityPercentage : null,
        matchedSkills: compatibility ? compatibility.matchedSkills : [],
        missingSkills: compatibility ? compatibility.missingSkills : [],
        matchedSkillsDetails: compatibility ? compatibility.matchedSkillsDetails || [] : [],
        missingSkillsDetails: compatibility ? compatibility.missingSkillsDetails || [] : [],
        isEligible: compatibility ? (compatibility.breakdown?.isEligible ?? true) : true,
        eligibilityReasons: compatibility ? (compatibility.breakdown?.eligibilityReasons || []) : [],
        breakdown: compatibility ? compatibility.breakdown : null
      };
    });

    // Sort candidates
    const activeSort = sortBy || 'best_match';
    if (activeSort === 'best_match') {
      formatted.sort((a, b) => (b.compatibilityScore ?? b.overallScore ?? 0) - (a.compatibilityScore ?? a.overallScore ?? 0));
    } else if (activeSort === 'cgpa') {
      formatted.sort((a, b) => (b.cgpa ?? 0) - (a.cgpa ?? 0));
    } else if (activeSort === 'experience') {
      formatted.sort((a, b) => (b.experienceScore || 0) - (a.experienceScore || 0));
    }

    res.status(200).json({
      success: true,
      count: formatted.length,
      students: formatted,
      selectedOpportunity: targetOpportunity ? {
        _id: targetOpportunity._id,
        title: targetOpportunity.title,
        type: targetOpportunity.type,
        requiredSkills: targetOpportunity.requiredSkills || [],
        minCgpa: targetOpportunity.minCgpa,
        eligibleBranches: targetOpportunity.eligibleBranches || []
      } : null,
      opportunities: opportunities.map(o => ({ 
        _id: o._id, 
        title: o.title, 
        type: o.type, 
        requiredSkills: o.requiredSkills || [] 
      }))
    });
  } catch (error) {
    console.error('Search Students Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving students catalog: ' + error.message });
  }
};

export const shortlistStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { opportunityId, notes } = req.body;

    const company = await Company.findOne({ userId: req.user.id });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }

    const student = await StudentProfile.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    let targetOppId = opportunityId;
    if (!targetOppId) {
      const defaultOpp = await Opportunity.findOne({ companyId: company._id, status: 'open' });
      if (defaultOpp) {
        targetOppId = defaultOpp._id;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Please select an open opportunity to shortlist this candidate for, or post a new opportunity first.'
        });
      }
    }

    let application = await Application.findOne({ studentId: student._id, opportunityId: targetOppId });
    const targetOpp = await Opportunity.findById(targetOppId);
    const match = targetOpp ? calculateDetailedCompatibility(student, targetOpp) : null;

    if (application) {
      application.status = 'shortlisted';
      if (match) {
        application.compatibilityScore = match.compatibilityScore;
        application.matchedSkills = match.matchedSkills;
        application.missingSkills = match.missingSkills;
      }
      await application.save();
    } else {
      application = await Application.create({
        opportunityId: targetOppId,
        studentId: student._id,
        status: 'shortlisted',
        resumeUrl: student.resumeUrl || 'https://skillnexus.ai/resumes/default.pdf',
        coverLetter: notes || 'Recruiter direct shortlist from Student Talent Discovery',
        compatibilityScore: match ? match.compatibilityScore : null,
        matchedSkills: match ? match.matchedSkills : [],
        missingSkills: match ? match.missingSkills : []
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student successfully shortlisted for this opportunity!',
      application
    });
  } catch (error) {
    console.error('Shortlist Student Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error shortlisting candidate' });
  }
};

export const rejectCandidate = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { opportunityId, reason } = req.body;

    const company = await Company.findOne({ userId: req.user.id });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }

    const student = await StudentProfile.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    let targetOppId = opportunityId;
    if (!targetOppId) {
      const defaultOpp = await Opportunity.findOne({ companyId: company._id, status: 'open' });
      if (defaultOpp) {
        targetOppId = defaultOpp._id;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Please specify the opportunity for this rejection.'
        });
      }
    }

    const targetOpp = await Opportunity.findOne({ _id: targetOppId, companyId: company._id });
    if (!targetOpp) {
      return res.status(403).json({ success: false, message: 'Not authorized to reject candidates for this opportunity.' });
    }

    let application = await Application.findOne({ studentId: student._id, opportunityId: targetOppId });
    if (application) {
      application.status = 'rejected';
      if (reason) {
        application.coverLetter = (application.coverLetter ? application.coverLetter + ' | Rejection Note: ' : 'Rejection Note: ') + reason;
      }
      await application.save();
    } else {
      application = await Application.create({
        opportunityId: targetOppId,
        studentId: student._id,
        status: 'rejected',
        resumeUrl: student.resumeUrl || 'https://skillnexus.ai/resumes/default.pdf',
        coverLetter: reason ? `Candidate marked as rejected: ${reason}` : 'Recruiter direct rejection from Talent Pool'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Candidate marked as rejected for this opportunity.',
      application
    });
  } catch (error) {
    console.error('Reject Candidate Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error rejecting candidate: ' + error.message });
  }
};

export const getRecommendedCandidates = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user.id });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }

    // 1. Fetch all active open opportunities for this company
    const opportunities = await Opportunity.find({ companyId: company._id, status: 'open' }).sort({ createdAt: -1 });

    if (!opportunities || opportunities.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        candidates: [],
        opportunities: [],
        activeOpportunity: null,
        message: 'No active job or internship openings found. Post an opening to activate candidate recommendations.'
      });
    }

    // 2. Determine target opportunity for recommendations
    let targetOpportunity = null;
    const requestedOppId = req.query.opportunityId;
    if (requestedOppId && requestedOppId !== 'all') {
      targetOpportunity = opportunities.find(o => o._id.toString() === requestedOppId);
      if (!targetOpportunity) {
        targetOpportunity = await Opportunity.findOne({ _id: requestedOppId, companyId: company._id });
      }
    }
    if (!targetOpportunity) {
      targetOpportunity = opportunities[0];
    }

    // 3. Fetch all applications for this opportunity to know student statuses (applied, shortlisted, rejected, etc.)
    const existingApplications = await Application.find({ opportunityId: targetOpportunity._id });
    const appMap = new Map();
    existingApplications.forEach(app => {
      appMap.set(app.studentId.toString(), {
        applicationId: app._id,
        status: app.status || 'applied'
      });
    });

    // 4. Fetch all active student profiles populated with user details
    const studentProfiles = await StudentProfile.find({})
      .populate('userId', 'name email avatarUrl status')
      .sort({ createdAt: -1 });

    const activeStudents = studentProfiles.filter(sp => sp.userId && sp.userId.status !== 'inactive');
    const includeRejected = req.query.includeRejected === 'true';

    // 5. Compute compatibility scores for each candidate
    const candidateList = [];

    activeStudents.forEach(sp => {
      const appInfo = appMap.get(sp._id.toString());
      const currentStatus = appInfo?.status || 'none';

      // By default, filter out rejected candidates
      if (currentStatus === 'rejected' && !includeRejected) {
        return;
      }

      const compatibility = calculateDetailedCompatibility(sp, targetOpportunity);

      const acad = sp.academicInformation || {};
      const degree = acad.degree || acad.course || '';
      const branch = acad.branch || acad.department || '';
      const college = acad.college || 'Zenith University Partner';
      const year = acad.year || acad.yearOfStudy || acad.expectedGraduationYear || 'Pre-final';
      const cgpa = acad.cgpa !== null && acad.cgpa !== undefined ? Number(acad.cgpa) : null;

      const eduParts = [degree, branch, college].filter(Boolean);
      const formattedEducation = eduParts.length > 0 ? eduParts.join(' • ') : 'Engineering Undergraduate';

      const keySkills = (sp.skillsList && sp.skillsList.length > 0)
        ? sp.skillsList.map(s => s.name)
        : (sp.skills || []);

      candidateList.push({
        _id: sp._id,
        studentId: sp._id,
        name: sp.userId?.name || 'Candidate',
        email: sp.userId?.email || '',
        avatarUrl: sp.userId?.avatarUrl || null,
        college,
        degree,
        branch,
        year,
        cgpa,
        education: formattedEducation,
        keySkills,
        skillsList: (sp.skillsList && sp.skillsList.length > 0)
          ? sp.skillsList.map(s => ({ name: s.name, proficiency: s.proficiency || 'Intermediate' }))
          : keySkills.map(s => ({ name: s, proficiency: 'Intermediate' })),
        matchedSkills: compatibility.matchedSkills,
        missingSkills: compatibility.missingSkills,
        matchedSkillsDetails: compatibility.matchedSkillsDetails || [],
        missingSkillsDetails: compatibility.missingSkillsDetails || [],
        compatibilityScore: compatibility.compatibilityScore,
        compatibilityPercentage: compatibility.compatibilityPercentage,
        skillMatchPercentage: compatibility.skillMatchPercentage,
        isEligible: compatibility.breakdown?.isEligible ?? true,
        eligibilityReasons: compatibility.breakdown?.eligibilityReasons || [],
        hasAllRequiredSkills: compatibility.hasAllRequiredSkills ?? true,
        breakdown: compatibility.breakdown,
        careerInterests: sp.careerInterests || [],
        projects: sp.projects || [],
        certifications: sp.certifications || [],
        resumeUrl: sp.resumeUrl || '',
        bio: sp.bio || '',
        applicationStatus: currentStatus,
        applicationId: appInfo?.applicationId || null
      });
    });

    // Sort descending by compatibility score
    candidateList.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    res.status(200).json({
      success: true,
      count: candidateList.length,
      candidates: candidateList,
      opportunities: opportunities.map(o => ({
        _id: o._id,
        title: o.title,
        type: o.type,
        status: o.status,
        requiredSkills: o.requiredSkills || [],
        location: o.location,
        minCgpa: o.minCgpa,
        eligibleBranches: o.eligibleBranches
      })),
      activeOpportunity: {
        _id: targetOpportunity._id,
        title: targetOpportunity.title,
        type: targetOpportunity.type,
        status: targetOpportunity.status,
        requiredSkills: targetOpportunity.requiredSkills || [],
        location: targetOpportunity.location,
        stipend: targetOpportunity.stipend,
        duration: targetOpportunity.duration,
        minCgpa: targetOpportunity.minCgpa,
        eligibleBranches: targetOpportunity.eligibleBranches
      }
    });
  } catch (error) {
    console.error('Get Recommended Candidates Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving recommended candidates: ' + error.message });
  }
};

export const getCandidateProfile = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { opportunityId } = req.query;

    let student = await StudentProfile.findById(studentId)
      .populate('userId', 'name email phone avatarUrl status createdAt');

    if (!student) {
      student = await StudentProfile.findOne({ userId: studentId })
        .populate('userId', 'name email phone avatarUrl status createdAt');
    }

    if (!student) {
      return res.status(404).json({ success: false, message: 'Candidate student profile not found' });
    }

    // Real assessment records from AssessmentResult collection
    const assessments = await AssessmentResult.find({ userId: student.userId?._id })
      .sort({ createdAt: -1 });

    // Target opportunity for matching
    let targetOpportunity = null;
    let compatibility = null;
    if (opportunityId && opportunityId !== 'all') {
      targetOpportunity = await Opportunity.findById(opportunityId);
    } else {
      const company = await Company.findOne({ userId: req.user.id });
      if (company) {
        targetOpportunity = await Opportunity.findOne({ companyId: company._id, status: 'open' });
      }
    }

    if (targetOpportunity) {
      compatibility = calculateDetailedCompatibility(student, targetOpportunity);
    }

    // Application status
    let applicationStatus = 'none';
    let application = null;
    if (targetOpportunity) {
      application = await Application.findOne({ studentId: student._id, opportunityId: targetOpportunity._id });
      if (application) {
        applicationStatus = application.status;
      }
    }

    const acad = student.academicInformation || {};
    const degree = acad.degree || acad.course || 'B.Tech';
    const branch = acad.branch || acad.department || 'Engineering';
    const college = acad.college || 'Zenith Partner University';
    const year = acad.year || acad.yearOfStudy || acad.expectedGraduationYear || 'Pre-final';
    const cgpa = acad.cgpa !== null && acad.cgpa !== undefined ? Number(acad.cgpa) : null;

    res.status(200).json({
      success: true,
      candidate: {
        _id: student._id,
        studentId: student._id,
        name: student.userId?.name || 'Candidate',
        email: student.userId?.email || '',
        phone: student.phone || student.userId?.phone || '',
        avatarUrl: student.userId?.avatarUrl || null,
        bio: student.bio || '',
        academicInformation: {
          degree,
          branch,
          department: branch,
          college,
          year,
          cgpa
        },
        education: [degree, branch, college].filter(Boolean).join(' • '),
        skillsList: (student.skillsList && student.skillsList.length > 0)
          ? student.skillsList.map(s => ({
              name: s.name,
              category: s.category || 'Technical',
              proficiency: s.proficiency || s.proficiencyLevel || 'Intermediate'
            }))
          : (student.skills || []).map(s => ({
              name: s,
              category: 'Technical',
              proficiency: 'Intermediate'
            })),
        skills: student.skills || [],
        softSkills: student.softSkills || [],
        assessments: assessments.map(a => ({
          _id: a._id,
          skill: a.skill,
          category: a.category || 'Technical Assessment',
          score: a.score,
          percentage: a.percentage ?? a.scorePercentage ?? 0,
          skillLevel: a.skillLevel || 'Intermediate',
          proficiencyEarned: a.proficiencyEarned || 'Intermediate',
          passed: a.passed,
          createdAt: a.createdAt
        })),
        projects: student.projects || [],
        certifications: student.certifications || [],
        internships: student.internships || [],
        achievements: student.achievements || [],
        socialLinks: student.socialLinks || {},
        resumeUrl: student.resumeUrl || '',
        resumeName: student.resumeName || 'Resume.pdf',
        compatibilityScore: compatibility ? compatibility.compatibilityScore : null,
        compatibilityPercentage: compatibility ? compatibility.compatibilityPercentage : null,
        matchedSkills: compatibility ? compatibility.matchedSkills : [],
        missingSkills: compatibility ? compatibility.missingSkills : [],
        matchedSkillsDetails: compatibility ? compatibility.matchedSkillsDetails : [],
        missingSkillsDetails: compatibility ? compatibility.missingSkillsDetails : [],
        isEligible: compatibility ? (compatibility.breakdown?.isEligible ?? true) : true,
        eligibilityReasons: compatibility ? (compatibility.breakdown?.eligibilityReasons || []) : [],
        breakdown: compatibility ? compatibility.breakdown : null,
        targetOpportunity: targetOpportunity ? {
          _id: targetOpportunity._id,
          title: targetOpportunity.title,
          type: targetOpportunity.type,
          location: targetOpportunity.location,
          requiredSkills: targetOpportunity.requiredSkills || [],
          minCgpa: targetOpportunity.minCgpa,
          eligibleBranches: targetOpportunity.eligibleBranches || []
        } : null,
        applicationStatus,
        applicationId: application?._id || null
      }
    });
  } catch (error) {
    console.error('Get Candidate Profile Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving candidate profile: ' + error.message });
  }
};

export const getShortlistedStudents = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user.id });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }

    const opportunities = await Opportunity.find({ companyId: company._id });
    const oppIds = opportunities.map(o => o._id);

    const applications = await Application.find({
      opportunityId: { $in: oppIds },
      status: { $in: ['shortlisted', 'accepted'] }
    })
      .populate('opportunityId', 'title type location stipend duration status')
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'name email avatarUrl status'
        }
      })
      .sort({ updatedAt: -1 });

    const formatted = applications.map(app => {
      const student = app.studentId;
      const u = student?.userId;
      const skills = (student?.skillsList && student.skillsList.length > 0)
        ? student.skillsList.map(s => ({
            name: s.name,
            proficiencyLevel: s.proficiencyLevel || 'Intermediate'
          }))
        : (student?.skills || []).map(s => ({
            name: s,
            proficiencyLevel: 'Intermediate'
          }));

      return {
        _id: app._id,
        applicationId: app._id,
        studentId: student?._id,
        name: u?.name || 'Student Candidate',
        email: u?.email || '',
        avatarUrl: u?.avatarUrl || null,
        college: student?.academicInformation?.college || student?.education?.[0]?.institutionName || 'Zenith Institute of Technology & Engineering',
        department: student?.academicInformation?.branch || student?.academicInformation?.department || student?.education?.[0]?.fieldOfStudy || 'Computer Science & Engineering',
        cgpa: student?.academicInformation?.cgpa ?? student?.education?.[0]?.grade ?? 8.5,
        skills,
        bio: student?.bio || '',
        projects: student?.projects || [],
        certifications: student?.certifications || [],
        resumeUrl: app.resumeUrl || student?.resumeUrl || '',
        opportunity: {
          _id: app.opportunityId?._id,
          title: app.opportunityId?.title || 'Open Role',
          type: app.opportunityId?.type || 'job',
          location: app.opportunityId?.location || 'Remote',
          stipend: app.opportunityId?.stipend || 'Competitive'
        },
        status: app.status,
        shortlistedDate: app.updatedAt || app.createdAt,
        interviewDetails: app.interviewDetails || null
      };
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      shortlisted: formatted
    });
  } catch (error) {
    console.error('Get Shortlisted Students Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving shortlisted candidates' });
  }
};

export const scheduleInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, mode, round, interviewType, interviewer, meetingLink, notes, status } = req.body;

    const userId = req.user?.id || req.user?._id;
    const company = await Company.findOne({ userId });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }

    const application = await Application.findById(id).populate('opportunityId');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.opportunityId.companyId.toString() !== company._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to schedule interviews for this applicant' });
    }

    const interviewStatus = (status || 'scheduled').toLowerCase();
    const scheduledDateTime = date ? new Date(`${date}T${time || '10:00'}:00`) : (application.interviewDetails?.scheduledAt || new Date());

    application.interviewDetails = {
      scheduledAt: scheduledDateTime,
      date: date || (application.interviewDetails?.date || ''),
      time: time || (application.interviewDetails?.time || '10:00 AM'),
      mode: mode || application.interviewDetails?.mode || 'video',
      round: round || application.interviewDetails?.round || 'Technical Evaluation Round 1',
      interviewType: interviewType || round || (application.interviewDetails?.interviewType || 'Technical Interview'),
      interviewer: interviewer || (application.interviewDetails?.interviewer || 'Technical Hiring Panel'),
      meetingLink: meetingLink || application.interviewDetails?.meetingLink || 'https://meet.google.com',
      notes: notes !== undefined ? notes : (application.interviewDetails?.notes || ''),
      status: interviewStatus
    };

    if (interviewStatus === 'completed') {
      application.status = 'accepted';
    } else if (interviewStatus === 'cancelled') {
      application.status = 'shortlisted';
    } else {
      application.status = 'interview';
    }

    await application.save();

    res.status(200).json({
      success: true,
      message: `Interview ${interviewStatus === 'completed' ? 'marked completed' : interviewStatus === 'cancelled' ? 'cancelled' : 'scheduled'} successfully!`,
      application
    });
  } catch (error) {
    console.error('Schedule Interview Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error scheduling candidate interview: ' + error.message });
  }
};

export const getCompanyInterviews = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const company = await Company.findOne({ userId });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }

    const opportunities = await Opportunity.find({ companyId: company._id });
    const oppIds = opportunities.map(o => o._id);

    const applications = await Application.find({
      opportunityId: { $in: oppIds },
      $or: [
        { status: { $in: ['shortlisted', 'interview', 'accepted'] } },
        { 'interviewDetails.scheduledAt': { $exists: true, $ne: null } }
      ]
    })
      .populate('opportunityId', 'title type location stipend duration status requiredSkills')
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'name email avatarUrl'
        }
      })
      .sort({ 'interviewDetails.scheduledAt': -1, updatedAt: -1 });

    const interviews = applications.map(app => {
      const student = app.studentId;
      const u = student?.userId;
      const interview = app.interviewDetails || {};
      const scheduledDate = interview.scheduledAt ? new Date(interview.scheduledAt) : new Date(app.updatedAt);

      return {
        _id: app._id,
        applicationId: app._id,
        studentId: student?._id,
        studentName: u?.name || 'Candidate',
        studentEmail: u?.email || '',
        avatarUrl: u?.avatarUrl || null,
        college: student?.academicInformation?.college || student?.education?.[0]?.institutionName || 'Zenith University Partner',
        department: student?.academicInformation?.branch || student?.academicInformation?.department || 'Computer Science & Engineering',
        opportunity: {
          _id: app.opportunityId?._id,
          title: app.opportunityId?.title || 'Open Opportunity',
          type: app.opportunityId?.type || 'job',
          location: app.opportunityId?.location || 'Remote'
        },
        rawDate: scheduledDate,
        date: scheduledDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: scheduledDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        mode: interview.mode || 'video',
        round: interview.round || 'Technical Evaluation Round 1',
        interviewType: interview.interviewType || interview.round || 'Technical Interview',
        interviewer: interview.interviewer || 'Technical Hiring Panel',
        meetingLink: interview.meetingLink || 'https://meet.google.com',
        notes: interview.notes || '',
        status: interview.status || (app.status === 'accepted' ? 'completed' : app.status === 'interview' ? 'scheduled' : 'scheduled')
      };
    });

    const availableCandidates = applications.map(app => ({
      applicationId: app._id,
      studentName: app.studentId?.userId?.name || 'Candidate',
      opportunityTitle: app.opportunityId?.title || 'Role'
    }));

    res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
      opportunities: opportunities.map(o => ({ _id: o._id, title: o.title, type: o.type })),
      availableCandidates
    });
  } catch (error) {
    console.error('Get Company Interviews Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving company interviews: ' + error.message });
  }
};

export const cancelInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;
    const company = await Company.findOne({ userId });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }

    const application = await Application.findById(id).populate('opportunityId');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.opportunityId.companyId.toString() !== company._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this interview' });
    }

    if (application.interviewDetails) {
      application.interviewDetails.status = 'cancelled';
    } else {
      application.interviewDetails = { status: 'cancelled' };
    }
    application.status = 'shortlisted';
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Interview marked as cancelled.',
      application
    });
  } catch (error) {
    console.error('Cancel Interview Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error cancelling interview: ' + error.message });
  }
};

export const getCompanyNotifications = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user.id });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }

    const opportunities = await Opportunity.find({ companyId: company._id }).sort({ createdAt: -1 });
    const oppIds = opportunities.map(o => o._id);

    const applications = await Application.find({ opportunityId: { $in: oppIds } })
      .populate('opportunityId', 'title type')
      .populate({
        path: 'studentId',
        populate: {
          path: 'userId',
          select: 'name email avatarUrl'
        }
      })
      .sort({ updatedAt: -1, createdAt: -1 });

    const readIds = new Set(company.readNotifications || []);
    const notifications = [];

    // 1. Notifications for Applications
    applications.forEach(app => {
      const studentName = app.studentId?.userId?.name || 'A student candidate';
      const oppTitle = app.opportunityId?.title || 'your open opportunity';
      const oppType = app.opportunityId?.type || 'job';
      const status = (app.status || 'applied').toLowerCase();

      // (a) New Application Notification
      const appId = `app_received_${app._id}`;
      notifications.push({
        id: appId,
        type: 'application',
        title: 'New Application Received',
        message: `${studentName} applied for ${oppTitle} (${oppType}).`,
        timestamp: app.createdAt,
        read: readIds.has(appId),
        link: '/company/applicants',
        meta: { studentName, oppTitle }
      });

      // (b) Application Reviewed Notification
      if (['reviewed', 'shortlisted', 'interview', 'selected', 'accepted'].includes(status)) {
        const revId = `app_reviewed_${app._id}`;
        notifications.push({
          id: revId,
          type: 'review',
          title: 'Application Under Review',
          message: `${studentName}'s profile and verified resume are being evaluated for ${oppTitle}.`,
          timestamp: app.updatedAt || app.createdAt,
          read: readIds.has(revId),
          link: '/company/applicants',
          meta: { studentName, oppTitle }
        });
      }

      // (c) Shortlist Notification
      if (['shortlisted', 'interview', 'selected', 'accepted'].includes(status)) {
        const shortId = `app_shortlisted_${app._id}`;
        notifications.push({
          id: shortId,
          type: 'shortlist',
          title: 'Candidate Shortlisted',
          message: `${studentName} is shortlisted for ${oppTitle}.`,
          timestamp: app.updatedAt,
          read: readIds.has(shortId),
          link: '/company/shortlisted',
          meta: { studentName, oppTitle }
        });
      }

      // (d) Candidate Rejected Notification
      if (status === 'rejected') {
        const rejId = `app_rejected_${app._id}`;
        notifications.push({
          id: rejId,
          type: 'rejection',
          title: 'Candidate Not Selected',
          message: `${studentName}'s application for ${oppTitle} was marked as rejected.`,
          timestamp: app.updatedAt,
          read: readIds.has(rejId),
          link: '/company/applicants',
          meta: { studentName, oppTitle }
        });
      }

      // (e) Interview Scheduled / Cancelled Notification
      if (app.interviewDetails?.scheduledAt || status === 'interview') {
        const isCancelled = (app.interviewDetails?.status || '').toLowerCase() === 'cancelled';
        const intId = isCancelled ? `interview_cancelled_${app._id}` : `interview_sched_${app._id}`;
        const formattedDate = app.interviewDetails?.scheduledAt 
          ? new Date(app.interviewDetails.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : 'Upcoming';
        
        notifications.push({
          id: intId,
          type: isCancelled ? 'interview_cancelled' : 'interview_scheduled',
          title: isCancelled ? 'Interview Cancelled' : 'Interview Scheduled',
          message: isCancelled 
            ? `The scheduled interview with ${studentName} for ${oppTitle} has been cancelled.`
            : `Interview scheduled with ${studentName} for ${oppTitle} on ${formattedDate} (${app.interviewDetails?.mode || 'video'}).`,
          timestamp: app.interviewDetails?.scheduledAt || app.updatedAt,
          read: readIds.has(intId),
          link: '/company/interviews',
          meta: { studentName, oppTitle, mode: app.interviewDetails?.mode }
        });
      }

      // (f) Candidate Selected / Offer Extended Notification
      if (['selected', 'accepted'].includes(status)) {
        const selId = `candidate_selected_${app._id}`;
        notifications.push({
          id: selId,
          type: 'selection',
          title: 'Candidate Selected 🎉',
          message: `${studentName} was selected for ${oppTitle}. Offer extended.`,
          timestamp: app.updatedAt,
          read: readIds.has(selId),
          link: '/company/applicants',
          meta: { studentName, oppTitle }
        });
      }

      // (g) Placement Completed Notification
      if (app.placementDetails?.isPlaced || ['selected', 'accepted'].includes(status)) {
        const placeId = `placement_completed_${app._id}`;
        notifications.push({
          id: placeId,
          type: 'placement_completed',
          title: 'Placement Recorded 🎓',
          message: `Official placement completed for ${studentName} (${oppTitle}).`,
          timestamp: app.placementDetails?.placedAt || app.updatedAt,
          read: readIds.has(placeId),
          link: '/company/applicants',
          meta: { studentName, oppTitle }
        });
      }
    });

    // 2. Notifications for Opportunity Activity & Relevant Candidate Matches
    const studentProfiles = await StudentProfile.find({}).populate('userId', 'status');
    const activeStudents = studentProfiles.filter(s => s.userId && s.userId.status !== 'inactive');

    opportunities.forEach(opp => {
      const oppNotifId = `opp_created_${opp._id}`;
      notifications.push({
        id: oppNotifId,
        type: 'opportunity',
        title: 'Opportunity Live',
        message: `Your ${opp.type} listing "${opp.title}" is active and accepting candidate applications.`,
        timestamp: opp.createdAt,
        read: readIds.has(oppNotifId),
        link: '/company/opportunities',
        meta: { oppTitle: opp.title, oppType: opp.type }
      });

      // Relevant Candidates Notification
      if (opp.status === 'open' && activeStudents.length > 0) {
        const matchingCount = activeStudents.filter(sp => {
          const compat = calculateDetailedCompatibility(sp, opp);
          return compat.compatibilityPercentage >= 70;
        }).length;

        if (matchingCount > 0) {
          const candNotifId = `relevant_candidates_${opp._id}`;
          notifications.push({
            id: candNotifId,
            type: 'talent_match',
            title: 'New Relevant Candidates Identified ✨',
            message: `${matchingCount} qualified candidate${matchingCount > 1 ? 's match' : ' matches'} your requirements for "${opp.title}". Review recommendations.`,
            timestamp: opp.updatedAt || opp.createdAt,
            read: readIds.has(candNotifId),
            link: '/company/recommended-candidates',
            meta: { oppTitle: opp.title, count: matchingCount }
          });
        }
      }
    });

    // Sort notifications chronologically (newest first)
    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const unreadCount = notifications.filter(n => !n.read).length;

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications
    });
  } catch (error) {
    console.error('Get Company Notifications Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving company notifications: ' + error.message });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Company.findOne({ userId: req.user.id });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }

    if (!company.readNotifications) company.readNotifications = [];
    if (!company.readNotifications.includes(id)) {
      company.readNotifications.push(id);
      await company.save();
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      readNotifications: company.readNotifications
    });
  } catch (error) {
    console.error('Mark Notification Read Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating notification status' });
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;
    const company = await Company.findOne({ userId: req.user.id });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }

    if (Array.isArray(notificationIds) && notificationIds.length > 0) {
      const existing = new Set(company.readNotifications || []);
      notificationIds.forEach(id => existing.add(id));
      company.readNotifications = Array.from(existing);
      await company.save();
    }

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
      readNotifications: company.readNotifications
    });
  } catch (error) {
    console.error('Mark All Notifications Read Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating notifications status' });
  }
};

export const getSkillInsights = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user.id });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }

    const opportunities = await Opportunity.find({ companyId: company._id }).sort({ createdAt: -1 });
    const oppIds = opportunities.map(o => o._id);

    const applications = await Application.find({ opportunityId: { $in: oppIds } })
      .populate('opportunityId', 'title type requiredSkills')
      .populate({
        path: 'studentId',
        select: 'skills skillsList academicInformation'
      });

    const allStudents = await StudentProfile.find({})
      .populate('userId', 'status')
      .select('skills skillsList academicInformation');
    const activeStudents = allStudents.filter(s => s.userId && s.userId.status !== 'inactive');

    // If company has no opportunities posted yet
    if (opportunities.length === 0) {
      return res.status(200).json({
        success: true,
        hasData: false,
        totalOpportunities: 0,
        activeOpportunities: 0,
        totalCandidatesEvaluated: activeStudents.length,
        averageCandidateCompatibility: 0,
        mostDemandedSkills: [],
        commonSkillGaps: [],
        skillAvailability: [],
        recruitmentOutcomes: {
          applied: 0,
          screening: 0,
          shortlisted: 0,
          interview: 0,
          selected: 0,
          rejected: 0,
          total: 0
        },
        message: 'No opportunities posted yet. Post job or internship openings to generate skill insights.'
      });
    }

    // 1. Calculate Most Demanded Skills
    const skillDemandCount = {};
    opportunities.forEach(opp => {
      (opp.requiredSkills || []).forEach(sk => {
        const clean = (typeof sk === 'string' ? sk : sk?.name || '').trim();
        if (clean) {
          skillDemandCount[clean] = (skillDemandCount[clean] || 0) + 1;
        }
      });
    });

    const mostDemandedSkills = Object.entries(skillDemandCount)
      .map(([name, count]) => ({
        skill: name,
        openingsCount: count,
        demandPercentage: Math.round((count / opportunities.length) * 100)
      }))
      .sort((a, b) => b.openingsCount - a.openingsCount);

    // 2. Calculate Skill Availability in Student Pool
    const demandedSkillsList = mostDemandedSkills.map(s => s.skill.toLowerCase());
    const totalStudentCount = activeStudents.length;

    const skillSupplyCount = {};
    activeStudents.forEach(sp => {
      const studentSkills = new Set(
        (sp.skillsList || []).map(s => (s.name || '').toLowerCase().trim())
          .concat((sp.skills || []).map(s => (typeof s === 'string' ? s : s?.name || '').toLowerCase().trim()))
          .filter(Boolean)
      );

      demandedSkillsList.forEach(demandedLower => {
        if (studentSkills.has(demandedLower)) {
          skillSupplyCount[demandedLower] = (skillSupplyCount[demandedLower] || 0) + 1;
        }
      });
    });

    const skillAvailability = mostDemandedSkills.map(item => {
      const lower = item.skill.toLowerCase();
      const studentsWithSkill = skillSupplyCount[lower] || 0;
      const availabilityPercentage = totalStudentCount > 0 
        ? Math.round((studentsWithSkill / totalStudentCount) * 100) 
        : 0;

      return {
        skill: item.skill,
        studentsCount: studentsWithSkill,
        totalStudents: totalStudentCount,
        availabilityPercentage,
        supplyStatus: availabilityPercentage >= 60 ? 'High' : availabilityPercentage >= 30 ? 'Moderate' : 'Low'
      };
    });

    // 3. Calculate Common Candidate Skill Gaps
    const gapMap = {};
    let totalEvaluations = 0;
    let totalCompatibilitySum = 0;

    const openOpportunities = opportunities.filter(o => o.status === 'open');
    const oppsToEvaluate = openOpportunities.length > 0 ? openOpportunities : opportunities;

    oppsToEvaluate.forEach(opp => {
      activeStudents.forEach(st => {
        const compat = calculateDetailedCompatibility(st, opp);
        totalCompatibilitySum += compat.compatibilityPercentage;
        totalEvaluations++;

        (compat.missingSkills || []).forEach(gapSkill => {
          gapMap[gapSkill] = (gapMap[gapSkill] || 0) + 1;
        });
      });
    });

    const commonSkillGaps = Object.entries(gapMap)
      .map(([skill, count]) => ({
        skill,
        missingCandidateCount: count,
        gapPercentage: totalEvaluations > 0 ? Math.round((count / totalEvaluations) * 100) : 0,
        severity: (count / (totalEvaluations || 1)) > 0.5 ? 'High Gap' : 'Moderate Gap'
      }))
      .sort((a, b) => b.missingCandidateCount - a.missingCandidateCount)
      .slice(0, 10);

    // 4. Average Candidate Compatibility
    const averageCandidateCompatibility = totalEvaluations > 0
      ? Math.round(totalCompatibilitySum / totalEvaluations)
      : 0;

    // 5. Recruitment Outcomes
    const outcomeCounts = {
      applied: 0,
      screening: 0,
      shortlisted: 0,
      interview: 0,
      selected: 0,
      rejected: 0,
      total: applications.length
    };

    applications.forEach(app => {
      const st = (app.status || 'applied').toLowerCase();
      if (st === 'reviewed') outcomeCounts.screening++;
      else if (st === 'accepted') outcomeCounts.selected++;
      else if (st === 'interviewing') outcomeCounts.interview++;
      else if (outcomeCounts[st] !== undefined) {
        outcomeCounts[st]++;
      } else {
        outcomeCounts.applied++;
      }
    });

    res.status(200).json({
      success: true,
      hasData: true,
      totalOpportunities: opportunities.length,
      activeOpportunities: openOpportunities.length,
      totalCandidatesEvaluated: totalStudentCount,
      averageCandidateCompatibility,
      mostDemandedSkills: mostDemandedSkills.slice(0, 10),
      commonSkillGaps,
      skillAvailability: skillAvailability.slice(0, 10),
      recruitmentOutcomes: outcomeCounts
    });
  } catch (error) {
    console.error('Get Skill Insights Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error generating skill insights: ' + error.message });
  }
};


