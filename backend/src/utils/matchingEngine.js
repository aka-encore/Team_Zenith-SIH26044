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
 * Backward compatibility export
 */
export const calculateCompatibility = (studentProfile, opportunity) => {
  const { matchPercentage } = matchSkills(studentProfile, opportunity);
  return matchPercentage;
};

export default {
  matchSkills,
  extractStudentSkills,
  extractOpportunitySkills,
  matchStudentWithOpportunities,
  matchOpportunityWithStudents,
  analyzeSkillGap,
  calculateCompatibility
};
