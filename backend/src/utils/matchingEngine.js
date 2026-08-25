/**
 * Core matching engine calculating weighted compatibility score between student profile and opportunity posting.
 * 
 * Weights breakdown:
 * 1. Technical Skills Match: 50%
 * 2. Academic Performance (CGPA): 20%
 * 3. Year of Study Eligibility: 15%
 * 4. Location overlap: 15%
 * 
 * Returns compatibility score as an integer percentage from 0 to 100.
 */
const calculateCompatibility = (studentProfile, opportunity) => {
  if (!studentProfile || !opportunity) return 0;

  let score = 0;

  // 1. Technical Skills Match (Weight: 50%)
  if (opportunity.requiredSkills && opportunity.requiredSkills.length > 0) {
    const requiredSkills = opportunity.requiredSkills.map(s => s.toLowerCase().trim());
    const studentSkills = (studentProfile.skills || []).map(s => s.toLowerCase().trim());

    let matchCount = 0;
    requiredSkills.forEach(reqSkill => {
      if (studentSkills.includes(reqSkill)) {
        matchCount++;
      }
    });

    const skillOverlapRatio = matchCount / requiredSkills.length;
    score += skillOverlapRatio * 50; // max 50 points
  } else {
    // Default to full skill points if the posting requires no technical skills
    score += 50;
  }

  // 2. Academic Performance / CGPA Match (Weight: 20%)
  const cgpa = studentProfile.academicInformation?.cgpa || 0;
  if (cgpa >= 9.0) {
    score += 20;
  } else if (cgpa >= 8.0) {
    score += 16;
  } else if (cgpa >= 7.0) {
    score += 12;
  } else if (cgpa >= 6.0) {
    score += 8;
  } else if (cgpa > 0) {
    score += 4;
  }

  // 3. Year of Study / Graduation Match (Weight: 15%)
  const year = Number(studentProfile.academicInformation?.year) || 0;
  if (year === 4) {
    score += 15;
  } else if (year === 3) {
    score += 12;
  } else if (year === 2) {
    score += 8;
  } else if (year === 1) {
    score += 4;
  }

  // 4. Location Match (Weight: 15%)
  const oppLoc = (opportunity.location || '').toLowerCase().trim();
  
  // Remote opportunities are 100% location matched
  if (oppLoc.includes('remote') || !oppLoc) {
    score += 15;
  } else {
    // Check if the student's location overlaps with opportunity location
    const studLoc = (studentProfile.location || '').toLowerCase().trim();
    const college = (studentProfile.academicInformation?.college || '').toLowerCase().trim();

    if (studLoc.includes(oppLoc) || oppLoc.includes(studLoc) || college.includes(oppLoc)) {
      score += 15;
    } else {
      score += 5; // Mismatched locations receive partial points
    }
  }

  return Math.round(score);
};

module.exports = {
  calculateCompatibility
};
