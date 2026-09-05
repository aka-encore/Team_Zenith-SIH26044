/**
 * ══════════════════════════════════════════════════════════════════════════
 * BACKEND SKILL MATCHING ENGINE
 * ══════════════════════════════════════════════════════════════════════════
 * 
 * Reusable matching engine for comparing student skills against opportunity required skills.
 * Used by:
 * 1. Student Opportunities (matching and scoring open job & internship postings)
 * 2. Company Student Search (filtering & candidate matching against requirements)
 * 3. Skill Gap Analysis (evaluating student readiness & missing competencies)
 */

/**
 * Safely extracts a clean array of unique skill names from various student data shapes
 * @param {Object|Array|string} student - StudentProfile model, plain object, array of skills, or string
 * @returns {string[]} Array of unique skill names
 */
export const extractStudentSkills = (student) => {
  if (!student) return [];

  const rawSkills = [];

  // If student is already an array of skills (strings or objects)
  if (Array.isArray(student)) {
    student.forEach(item => {
      if (typeof item === 'string' && item.trim()) {
        rawSkills.push(item.trim());
      } else if (item && typeof item === 'object' && item.name && typeof item.name === 'string') {
        rawSkills.push(item.name.trim());
      }
    });
  } else if (typeof student === 'object') {
    // Check structured skillsList in StudentProfile
    if (Array.isArray(student.skillsList) && student.skillsList.length > 0) {
      student.skillsList.forEach(item => {
        if (item && item.name && typeof item.name === 'string' && item.name.trim()) {
          rawSkills.push(item.name.trim());
        }
      });
    }

    // Check legacy / flat skills array in StudentProfile
    if (Array.isArray(student.skills) && student.skills.length > 0) {
      student.skills.forEach(s => {
        if (typeof s === 'string' && s.trim()) {
          rawSkills.push(s.trim());
        } else if (s && typeof s === 'object' && s.name && typeof s.name === 'string') {
          rawSkills.push(s.name.trim());
        }
      });
    }

    // Check softSkills if available
    if (Array.isArray(student.softSkills) && student.softSkills.length > 0) {
      student.softSkills.forEach(s => {
        if (typeof s === 'string' && s.trim()) {
          rawSkills.push(s.trim());
        }
      });
    }

    // Check if skills is a comma-separated string
    if (typeof student.skills === 'string' && student.skills.trim()) {
      student.skills.split(',').forEach(s => {
        if (s.trim()) rawSkills.push(s.trim());
      });
    }
  } else if (typeof student === 'string' && student.trim()) {
    student.split(',').forEach(s => {
      if (s.trim()) rawSkills.push(s.trim());
    });
  }

  // Deduplicate case-insensitively while preserving first encountered casing
  const seen = new Set();
  const uniqueSkills = [];

  rawSkills.forEach(skill => {
    const normalized = skill.toLowerCase().trim();
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      uniqueSkills.push(skill.trim());
    }
  });

  return uniqueSkills;
};

/**
 * Safely extracts a clean array of required skill names from opportunity data shapes
 * @param {Object|Array|string} opportunity - Opportunity model, plain object, array of skills, or string
 * @returns {string[]} Array of unique required skill names
 */
export const extractOpportunitySkills = (opportunity) => {
  if (!opportunity) return [];

  const rawSkills = [];

  // If opportunity is already an array of strings or objects
  if (Array.isArray(opportunity)) {
    opportunity.forEach(item => {
      if (typeof item === 'string' && item.trim()) {
        rawSkills.push(item.trim());
      } else if (item && typeof item === 'object' && item.name && typeof item.name === 'string') {
        rawSkills.push(item.name.trim());
      }
    });
  } else if (typeof opportunity === 'object') {
    // Check requiredSkills array
    if (Array.isArray(opportunity.requiredSkills)) {
      opportunity.requiredSkills.forEach(s => {
        if (typeof s === 'string' && s.trim()) {
          rawSkills.push(s.trim());
        } else if (s && typeof s === 'object' && s.name && typeof s.name === 'string') {
          rawSkills.push(s.name.trim());
        }
      });
    } else if (typeof opportunity.requiredSkills === 'string' && opportunity.requiredSkills.trim()) {
      opportunity.requiredSkills.split(',').forEach(s => {
        if (s.trim()) rawSkills.push(s.trim());
      });
    } else if (Array.isArray(opportunity.skills)) {
      opportunity.skills.forEach(s => {
        if (typeof s === 'string' && s.trim()) rawSkills.push(s.trim());
      });
    }
  } else if (typeof opportunity === 'string' && opportunity.trim()) {
    opportunity.split(',').forEach(s => {
      if (s.trim()) rawSkills.push(s.trim());
    });
  }

  // Deduplicate case-insensitively while preserving original casing
  const seen = new Set();
  const uniqueSkills = [];

  rawSkills.forEach(skill => {
    const normalized = skill.toLowerCase().trim();
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      uniqueSkills.push(skill.trim());
    }
  });

  return uniqueSkills;
};

/**
 * ══════════════════════════════════════════════════════════════════════════
 * PRIMARY SKILL MATCHING FUNCTION
 * ══════════════════════════════════════════════════════════════════════════
 * 
 * 1. Gets the student's skills.
 * 2. Gets the opportunity's required skills.
 * 3. Compares them case-insensitively.
 * 4. Finds matched skills.
 * 5. Finds missing skills.
 * 6. Calculates Match Percentage = (matched required skills / total required skills) * 100
 * 
 * @param {Object|Array} student - StudentProfile or skills
 * @param {Object|Array} opportunity - Opportunity or requiredSkills
 * @returns {{
 *   matchPercentage: number,
 *   matchedSkills: string[],
 *   missingSkills: string[],
 *   totalRequiredSkills: number,
 *   totalMatchedSkills: number,
 *   studentSkills: string[]
 * }}
 */
export const matchSkills = (student, opportunity) => {
  const studentSkills = extractStudentSkills(student);
  const requiredSkills = extractOpportunitySkills(opportunity);

  // Map of lowercase student skills for fast O(1) case-insensitive lookup
  const studentSkillLookup = new Set(
    studentSkills.map(s => s.toLowerCase().trim()).filter(Boolean)
  );

  const matchedSkills = [];
  const missingSkills = [];

  requiredSkills.forEach(reqSkill => {
    const normalizedReq = reqSkill.toLowerCase().trim();
    if (studentSkillLookup.has(normalizedReq)) {
      matchedSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  });

  const totalRequiredSkills = requiredSkills.length;
  const totalMatchedSkills = matchedSkills.length;

  // Calculate Match Percentage:
  // If an opportunity has no required skills specified, default match to 100%
  const matchPercentage = totalRequiredSkills > 0
    ? Math.round((totalMatchedSkills / totalRequiredSkills) * 100)
    : 100;

  return {
    matchPercentage,
    matchedSkills,
    missingSkills,
    totalRequiredSkills,
    totalMatchedSkills,
    studentSkills
  };
};

/**
 * Matches a student against an array of opportunities and attaches match metadata
 * @param {Object} student - StudentProfile document or skills
 * @param {Array} opportunities - Array of Opportunity documents
 * @returns {Array} Formatted opportunities sorted by matchPercentage descending
 */
export const matchStudentWithOpportunities = (student, opportunities = []) => {
  if (!Array.isArray(opportunities)) return [];

  return opportunities.map(opp => {
    const oppObj = typeof opp.toObject === 'function' ? opp.toObject() : { ...opp };
    const match = matchSkills(student, opp);

    return {
      ...oppObj,
      matchPercentage: match.matchPercentage,
      matchedSkills: match.matchedSkills,
      missingSkills: match.missingSkills,
      compatibilityScore: match.matchPercentage // Backward compatibility
    };
  }).sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
};

/**
 * Matches an opportunity against an array of student profiles and attaches match metadata
 * @param {Object} opportunity - Opportunity document or required skills
 * @param {Array} students - Array of StudentProfile documents
 * @returns {Array} Formatted students sorted by matchPercentage descending
 */
export const matchOpportunityWithStudents = (opportunity, students = []) => {
  if (!Array.isArray(students)) return [];

  return students.map(student => {
    const studObj = typeof student.toObject === 'function' ? student.toObject() : { ...student };
    const match = matchSkills(student, opportunity);

    return {
      ...studObj,
      matchPercentage: match.matchPercentage,
      matchedSkills: match.matchedSkills,
      missingSkills: match.missingSkills,
      compatibilityScore: match.matchPercentage
    };
  }).sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
};

/**
 * Analyzes skill gaps between a student and a target role or opportunity
 * @param {Object} student - StudentProfile document or skills
 * @param {Object|Array} targetRoleOrOpportunity - Opportunity document, target role object, or required skills
 * @returns {Object} Detailed skill gap report
 */
export const analyzeSkillGap = (student, targetRoleOrOpportunity) => {
  const match = matchSkills(student, targetRoleOrOpportunity);
  const studentSkills = extractStudentSkills(student);

  return {
    matchPercentage: match.matchPercentage,
    matchedSkills: match.matchedSkills,
    missingSkills: match.missingSkills,
    totalRequiredSkills: match.totalRequiredSkills,
    totalMatchedSkills: match.totalMatchedSkills,
    studentSkillsCount: studentSkills.length,
    studentSkills
  };
};

/**
 * ══════════════════════════════════════════════════════════════════════════
 * TRANSPARENT WEIGHTED SKILL COMPATIBILITY ENGINE (SRS COMPLIANT)
 * ══════════════════════════════════════════════════════════════════════════
 * 
 * Computes deterministic, transparent compatibility between a candidate and an opportunity:
 * 1. Skill Match & Proficiency (70% weight):
 *    - Structured required skills: name, importance ('required' vs 'preferred'), proficiency, weight.
 *    - Proficiency comparison: Beginner (1), Intermediate (2), Advanced (3), Expert (4).
 *    - Full weight if proficiency met or exceeded (with up to +10% bonus for exceeding).
 *    - Scaled partial credit if candidate proficiency is below requirement.
 * 2. Academic Eligibility (20% weight):
 *    - Minimum CGPA constraint.
 *    - Eligible branches/disciplines.
 *    - Eligible academic cohorts/years.
 * 3. Career Interest Alignment (10% weight):
 *    - Candidate's career interests and focus domains vs opportunity role.
 * 
 * @param {Object} student - StudentProfile document or plain object
 * @param {Object} opportunity - Opportunity document or plain object
 * @returns {Object} Full transparent match breakdown
 */

const PROFICIENCY_LEVELS = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4
};

const getProficiencyLevel = (profStr) => {
  if (!profStr) return 2; // default intermediate
  const p = String(profStr).toLowerCase().trim();
  if (p.includes('expert')) return 4;
  if (p.includes('adv')) return 3;
  if (p.includes('inter')) return 2;
  if (p.includes('beg')) return 1;
  return 2;
};

/**
 * Extracts structured required skills [{ name, importance, proficiency, weight }]
 * from various opportunity data representations.
 */
export const extractStructuredOpportunitySkills = (opportunity) => {
  if (!opportunity) return [];

  let rawList = [];
  if (Array.isArray(opportunity)) {
    rawList = opportunity;
  } else if (opportunity && typeof opportunity === 'object') {
    if (Array.isArray(opportunity.requiredSkills)) {
      rawList = opportunity.requiredSkills;
    } else if (typeof opportunity.requiredSkills === 'string' && opportunity.requiredSkills.trim()) {
      rawList = opportunity.requiredSkills.split(',');
    } else if (Array.isArray(opportunity.skills)) {
      rawList = opportunity.skills;
    }
  } else if (typeof opportunity === 'string' && opportunity.trim()) {
    rawList = opportunity.split(',');
  }

  const total = rawList.length || 1;
  const defaultWeight = Math.max(5, Math.round(100 / total));

  const seen = new Set();
  const structured = [];

  rawList.forEach(item => {
    if (!item) return;
    let name = '';
    let importance = 'required';
    let proficiency = 'intermediate';
    let weight = defaultWeight;

    if (typeof item === 'string') {
      name = item.trim();
    } else if (typeof item === 'object') {
      name = (item.name || '').trim();
      const imp = (item.importance || 'required').toLowerCase();
      importance = ['required', 'preferred'].includes(imp) ? imp : 'required';
      const prof = (item.proficiency || item.proficiencyLevel || 'intermediate').toLowerCase();
      proficiency = ['beginner', 'intermediate', 'advanced', 'expert'].includes(prof) ? prof : 'intermediate';
      weight = Number(item.weight) > 0 ? Number(item.weight) : defaultWeight;
    }

    if (name) {
      const norm = name.toLowerCase();
      if (!seen.has(norm)) {
        seen.add(norm);
        structured.push({
          name,
          importance,
          proficiency,
          weight
        });
      }
    }
  });

  return structured;
};

export const calculateDetailedCompatibility = (student, opportunity) => {
  if (!student || !opportunity) {
    return {
      compatibilityScore: 0,
      compatibilityPercentage: 0,
      matchPercentage: 0,
      skillMatchPercentage: 0,
      matchedSkills: [],
      missingSkills: [],
      matchedSkillsDetails: [],
      missingSkillsDetails: [],
      totalRequiredSkills: 0,
      totalMatchedSkills: 0,
      hasAllRequiredSkills: false,
      missingRequiredCount: 0,
      breakdown: {
        skillScore: 0,
        eligibilityScore: 100,
        careerInterestScore: 70,
        isEligible: true,
        eligibilityReasons: [],
        careerInterestMatch: false,
        totalWeight: 0,
        totalEarnedWeight: 0,
        weights: {
          skillsWeight: 70,
          eligibilityWeight: 20,
          careerInterestWeight: 10
        }
      }
    };
  }

  // 1. Extract Student Skills & Build Comprehensive Proficiency Map
  const studentSkillMap = new Map();

  // Populate from structured skillsList if present
  if (Array.isArray(student.skillsList)) {
    student.skillsList.forEach(item => {
      if (item && item.name && typeof item.name === 'string' && item.name.trim()) {
        const norm = item.name.toLowerCase().trim();
        const profStr = item.proficiency || item.proficiencyLevel || 'Intermediate';
        studentSkillMap.set(norm, {
          name: item.name.trim(),
          level: getProficiencyLevel(profStr),
          proficiency: profStr
        });
      }
    });
  }

  // Populate from flat skills array (defaults to Intermediate level 2)
  const flatSkills = extractStudentSkills(student);
  flatSkills.forEach(skillName => {
    const norm = skillName.toLowerCase().trim();
    if (!studentSkillMap.has(norm)) {
      studentSkillMap.set(norm, {
        name: skillName.trim(),
        level: 2,
        proficiency: 'Intermediate'
      });
    }
  });

  // 2. Extract Opportunity Structured Required Skills & Compute Earned Weight
  const requiredSkillsList = extractStructuredOpportunitySkills(opportunity);
  const matchedSkills = [];
  const missingSkills = [];
  const matchedSkillsDetails = [];
  const missingSkillsDetails = [];

  let totalWeight = 0;
  let totalEarnedWeight = 0;
  let missingRequiredCount = 0;

  requiredSkillsList.forEach(reqSkill => {
    const normReq = reqSkill.name.toLowerCase().trim();
    const reqLevel = PROFICIENCY_LEVELS[reqSkill.proficiency] || 2;
    totalWeight += reqSkill.weight;

    let candSkill = null;
    let isAlias = false;

    if (studentSkillMap.has(normReq)) {
      candSkill = studentSkillMap.get(normReq);
    } else {
      // Fuzzy / alias substring check for common variations (e.g. 'React' vs 'React.js', 'Node' vs 'NodeJS')
      for (const [sNorm, sData] of studentSkillMap.entries()) {
        if (
          (normReq.length > 2 && sNorm.includes(normReq)) ||
          (sNorm.length > 2 && normReq.includes(sNorm))
        ) {
          candSkill = sData;
          isAlias = true;
          break;
        }
      }
    }

    if (candSkill) {
      const candLevel = candSkill.level;
      let multiplier = 1.0;

      if (candLevel === reqLevel) {
        multiplier = 1.0;
      } else if (candLevel > reqLevel) {
        // Exceeds requirement: award slight bonus (capped at 1.10)
        multiplier = Math.min(1.10, 1.0 + (candLevel - reqLevel) * 0.05);
      } else {
        // Below requirement: partial credit based on gap
        multiplier = Math.max(0.35, 1.0 - (reqLevel - candLevel) * 0.25);
      }

      if (isAlias) {
        multiplier *= 0.95; // Minor discount for alias normalization
      }

      const earned = reqSkill.weight * multiplier;
      totalEarnedWeight += earned;

      matchedSkills.push(reqSkill.name);
      matchedSkillsDetails.push({
        name: reqSkill.name,
        importance: reqSkill.importance,
        requiredProficiency: reqSkill.proficiency,
        candidateProficiency: candSkill.proficiency,
        weight: reqSkill.weight,
        earnedWeight: Math.round(earned * 10) / 10,
        proficiencyMet: candLevel >= reqLevel
      });
    } else {
      if (reqSkill.importance === 'required') {
        missingRequiredCount += 1;
      }

      missingSkills.push(reqSkill.name);
      missingSkillsDetails.push({
        name: reqSkill.name,
        importance: reqSkill.importance,
        requiredProficiency: reqSkill.proficiency,
        weight: reqSkill.weight,
        isCritical: reqSkill.importance === 'required'
      });
    }
  });

  const totalRequiredSkills = requiredSkillsList.length;
  const totalMatchedSkills = matchedSkills.length;
  const rawSkillPercentage = totalRequiredSkills > 0
    ? Math.round((totalMatchedSkills / totalRequiredSkills) * 100)
    : 100;

  // Weighted Skill Score (taking weights and proficiency comparison into account)
  const skillScore = totalWeight > 0
    ? Math.min(100, Math.max(0, Math.round((totalEarnedWeight / totalWeight) * 100)))
    : 100;

  // 3. Academic Eligibility Evaluation (20% Weight)
  let isEligible = true;
  const eligibilityReasons = [];
  let cgpaScore = 100;
  let branchScore = 100;
  let yearScore = 100;

  const academicInfo = student.academicInformation || {};

  // (a) Minimum CGPA Check
  if (opportunity.minCgpa !== undefined && opportunity.minCgpa !== null && !isNaN(Number(opportunity.minCgpa))) {
    const requiredCgpa = Number(opportunity.minCgpa);
    const studentCgpa = academicInfo.cgpa !== null && academicInfo.cgpa !== undefined ? Number(academicInfo.cgpa) : null;
    if (studentCgpa !== null) {
      if (studentCgpa >= requiredCgpa) {
        cgpaScore = 100;
      } else if (studentCgpa >= requiredCgpa - 0.5) {
        cgpaScore = 70;
        isEligible = false;
        eligibilityReasons.push(`CGPA (${studentCgpa}) is slightly below required threshold (${requiredCgpa})`);
      } else {
        cgpaScore = 40;
        isEligible = false;
        eligibilityReasons.push(`CGPA (${studentCgpa}) does not satisfy minimum threshold of ${requiredCgpa}`);
      }
    } else {
      cgpaScore = 80; // neutral when unrecorded
    }
  }

  // (b) Eligible Branches Check
  if (Array.isArray(opportunity.eligibleBranches) && opportunity.eligibleBranches.length > 0) {
    const studentBranch = (academicInfo.branch || academicInfo.department || academicInfo.course || '').toLowerCase().trim();
    if (studentBranch) {
      const branchMatches = opportunity.eligibleBranches.some(b => {
        const normB = String(b).toLowerCase().trim();
        return studentBranch.includes(normB) || normB.includes(studentBranch);
      });
      if (branchMatches) {
        branchScore = 100;
      } else {
        branchScore = 50;
        isEligible = false;
        eligibilityReasons.push(`Branch (${academicInfo.branch || 'Not specified'}) is outside eligible disciplines`);
      }
    } else {
      branchScore = 75;
    }
  }

  // (c) Eligible Years Check
  if (Array.isArray(opportunity.eligibleYears) && opportunity.eligibleYears.length > 0) {
    const studentYear = String(academicInfo.year || academicInfo.yearOfStudy || academicInfo.expectedGraduationYear || '').toLowerCase().trim();
    if (studentYear) {
      const yearMatches = opportunity.eligibleYears.some(y => {
        const normY = String(y).toLowerCase().trim();
        return studentYear.includes(normY) || normY.includes(studentYear);
      });
      if (yearMatches) {
        yearScore = 100;
      } else {
        yearScore = 60;
        isEligible = false;
        eligibilityReasons.push(`Academic Year (${studentYear}) does not match target cohort`);
      }
    } else {
      yearScore = 80;
    }
  }

  const eligibilityScore = Math.round((cgpaScore * 0.5) + (branchScore * 0.3) + (yearScore * 0.2));

  // 4. Career Interest Alignment (10% Weight)
  const careerInterests = Array.isArray(student.careerInterests) ? student.careerInterests : [];
  let careerInterestMatch = false;
  let careerInterestScore = 70; // baseline if no specific interests listed

  const oppTokens = [
    opportunity.title || '',
    opportunity.type || '',
    opportunity.description || '',
    ...(requiredSkillsList.map(s => s.name))
  ].join(' ').toLowerCase();

  if (careerInterests.length > 0) {
    const matchedInterest = careerInterests.some(interest => {
      const normInterest = String(interest).toLowerCase().trim();
      return normInterest.length > 2 && oppTokens.includes(normInterest);
    });

    if (matchedInterest) {
      careerInterestMatch = true;
      careerInterestScore = 100;
    } else {
      careerInterestScore = 55;
    }
  } else if (student.bio && student.bio.trim()) {
    const bioNorm = student.bio.toLowerCase();
    const roleKeywords = (opportunity.title || '').toLowerCase().split(' ').filter(w => w.length > 3);
    if (roleKeywords.some(kw => bioNorm.includes(kw))) {
      careerInterestMatch = true;
      careerInterestScore = 90;
    }
  }

  // 5. Final Overall Compatibility Calculation (70% Skills + 20% Eligibility + 10% Interests)
  const overallCompatibility = Math.min(100, Math.max(0, Math.round(
    (skillScore * 0.70) + (eligibilityScore * 0.20) + (careerInterestScore * 0.10)
  )));

  return {
    compatibilityScore: overallCompatibility,
    compatibilityPercentage: overallCompatibility,
    matchPercentage: overallCompatibility,
    skillMatchPercentage: rawSkillPercentage,
    matchedSkills,
    missingSkills,
    matchedSkillsDetails,
    missingSkillsDetails,
    totalRequiredSkills,
    totalMatchedSkills,
    hasAllRequiredSkills: missingRequiredCount === 0,
    missingRequiredCount,
    breakdown: {
      skillScore,
      eligibilityScore,
      careerInterestScore,
      isEligible,
      eligibilityReasons,
      careerInterestMatch,
      totalWeight,
      totalEarnedWeight: Math.round(totalEarnedWeight * 10) / 10,
      weights: {
        skillsWeight: 70,
        eligibilityWeight: 20,
        careerInterestWeight: 10
      }
    }
  };
};

/**
 * Backward compatibility export
 */
export const calculateCompatibility = (studentProfile, opportunity) => {
  const result = calculateDetailedCompatibility(studentProfile, opportunity);
  return result.compatibilityScore;
};

export default {
  matchSkills,
  extractStudentSkills,
  extractOpportunitySkills,
  extractStructuredOpportunitySkills,
  matchStudentWithOpportunities,
  matchOpportunityWithStudents,
  analyzeSkillGap,
  calculateCompatibility,
  calculateDetailedCompatibility
};

