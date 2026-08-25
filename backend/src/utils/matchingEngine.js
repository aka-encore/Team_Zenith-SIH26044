/**
 * Weighted student↔opportunity score (0–100):
 * skills 50% + CGPA 20% + study year 15% + location 15%
 */
export const calculateCompatibility = (studentProfile, opportunity) => {
  if (!studentProfile || !opportunity) return 0;

  let score = 0;
  const required = (opportunity.requiredSkills || []).map(s => s.toLowerCase().trim());
  if (required.length === 0) {
    score += 50;
  } else {
    const studentSkills = new Set((studentProfile.skills || []).map(s => s.toLowerCase().trim()));
    const hits = required.filter(s => studentSkills.has(s)).length;
    score += (hits / required.length) * 50;
  }

  const cgpa = studentProfile.academicInformation?.cgpa || 0;
  if (cgpa >= 9) score += 20;
  else if (cgpa >= 8) score += 16;
  else if (cgpa >= 7) score += 12;
  else if (cgpa >= 6) score += 8;
  else if (cgpa > 0) score += 4;

  const year = Number(studentProfile.academicInformation?.year) || 0;
  if (year === 4) score += 15;
  else if (year === 3) score += 12;
  else if (year === 2) score += 8;
  else if (year === 1) score += 4;

  const oppLoc = (opportunity.location || '').toLowerCase().trim();
  if (!oppLoc || oppLoc.includes('remote')) {
    score += 15;
  } else {
    const studLoc = (studentProfile.location || '').toLowerCase().trim();
    const college = (studentProfile.academicInformation?.college || '').toLowerCase().trim();
    score += (studLoc.includes(oppLoc) || oppLoc.includes(studLoc) || college.includes(oppLoc)) ? 15 : 5;
  }

  return Math.round(score);
};
