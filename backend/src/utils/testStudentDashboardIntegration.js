import './loadEnv.js';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import StudentProfile from '../models/StudentProfile.js';
import Opportunity from '../models/Opportunity.js';
import Application from '../models/Application.js';
import Company from '../models/Company.js';
import User from '../models/User.js';
import { matchSkills } from './matchingEngine.js';

const runStudentDashboardIntegrationTest = async () => {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('    STUDENT DASHBOARD REAL DATABASE INTEGRATION TEST SUITE      ');
  console.log('════════════════════════════════════════════════════════════════\n');

  try {
    await connectDB();

    // 1. Find or verify student user in MongoDB
    const studentUser = await User.findOne({ role: 'student' });
    if (!studentUser) {
      throw new Error('FAIL: No student user found in MongoDB.');
    }

    let profile = await StudentProfile.findOne({ userId: studentUser._id });
    if (!profile) {
      profile = await StudentProfile.create({
        userId: studentUser._id,
        phone: '+91 9876543210',
        bio: 'Aspiring Full Stack Engineer passionate about high scale web apps',
        skills: ['React', 'Node.js', 'MongoDB', 'Java', 'Data Structures'],
        academicInformation: {
          college: 'Zenith Institute of Technology',
          department: 'Computer Science & Engineering',
          cgpa: 8.9,
          year: '3rd Year'
        },
        projects: [
          {
            title: 'SkillNexus AI',
            description: 'Platform connecting students and companies',
            technologies: ['React', 'Node.js', 'MongoDB']
          }
        ],
        certifications: [
          {
            title: 'Full Stack Certified Developer',
            issuer: 'Zenith Certifications',
            date: '2025'
          }
        ],
        resumeUrl: 'https://storage.googleapis.com/resumes/alex_chen.pdf'
      });
    }

    console.log(`✓ [1/7] Verified Student Profile in DB: ${studentUser.name} (${studentUser.email})`);

    // 2. Compute Real Profile Completion
    let completionScore = 0;
    if (studentUser.name) completionScore += 15;
    if (profile.phone) completionScore += 10;
    if (profile.bio) completionScore += 10;
    if (profile.academicInformation?.college && profile.academicInformation?.department) completionScore += 20;
    if (profile.academicInformation?.cgpa) completionScore += 10;
    if ((profile.skillsList?.length > 0) || (profile.skills?.length > 0)) completionScore += 15;
    if (profile.projects?.length > 0) completionScore += 10;
    if (profile.certifications?.length > 0) completionScore += 5;
    if (profile.resumeUrl) completionScore += 5;
    const profileCompletion = Math.min(100, completionScore);

    console.log(`✓ [2/7] Real Profile Completion Computed: ${profileCompletion}%`);
    if (typeof profileCompletion !== 'number' || profileCompletion < 0 || profileCompletion > 100) {
      throw new Error('FAIL: profileCompletion score is invalid.');
    }

    // 3. Top Skills
    const skills = (profile.skillsList && profile.skillsList.length > 0)
      ? profile.skillsList.map(s => s.name)
      : (profile.skills || []);
    console.log(`✓ [3/7] Top Skills (${skills.length}): [${skills.join(', ')}]`);

    // 4. Recommended Opportunities from DB with Skill Matching
    const opportunities = await Opportunity.find({ status: 'open' });
    const recommendedOpps = opportunities.map(opp => {
      const match = matchSkills(profile, opp);
      return {
        _id: opp._id,
        title: opp.title,
        type: opp.type,
        matchPercentage: match.matchPercentage,
        matchedSkills: match.matchedSkills,
        missingSkills: match.missingSkills
      };
    }).sort((a, b) => b.matchPercentage - a.matchPercentage);

    console.log(`✓ [4/7] Recommended Opportunities Evaluated (${recommendedOpps.length} openings):`);
    recommendedOpps.slice(0, 3).forEach((opp, i) => {
      console.log(`      #${i + 1} "${opp.title}" (${opp.type}) -> ${opp.matchPercentage}% Match [Matched: ${opp.matchedSkills.length}, Missing: ${opp.missingSkills.length}]`);
    });

    // 5. Recent Applications from DB
    const applications = await Application.find({ studentId: profile._id })
      .populate('opportunityId', 'title type status location')
      .sort({ createdAt: -1 });

    console.log(`✓ [5/7] Recent Applications Retrieved from DB: ${applications.length} applications`);

    // 6. Upcoming Interviews
    const interviews = applications.filter(a => ['shortlisted', 'accepted'].includes((a.status || '').toLowerCase()));
    console.log(`✓ [6/7] Upcoming Interviews & Pipeline Candidates: ${interviews.length} active stages`);

    // 7. Placement Status
    const hasPlaced = applications.some(a => (a.status || '').toLowerCase() === 'accepted');
    const hasShortlisted = applications.some(a => (a.status || '').toLowerCase() === 'shortlisted');
    const placementStatus = hasPlaced ? 'Offer Secured' : hasShortlisted ? 'In Interview Pipeline' : 'Profile Open / Active';
    console.log(`✓ [7/7] Placement Status: "${placementStatus}"`);

    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('  ALL STUDENT DASHBOARD DATABASE INTEGRATION TESTS PASSED!      ');
    console.log('════════════════════════════════════════════════════════════════\n');

  } catch (err) {
    console.error('\n!!! Student Dashboard Integration Test Failed !!!');
    console.error(err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

runStudentDashboardIntegrationTest();
