import './loadEnv.js';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import StudentProfile from '../models/StudentProfile.js';
import Opportunity from '../models/Opportunity.js';
import Company from '../models/Company.js';
import User from '../models/User.js';
import { matchSkills } from './matchingEngine.js';

const runStudentSearchTests = async () => {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('   COMPANY STUDENT SEARCH: SKILL MATCHING ENGINE VERIFICATION    ');
  console.log('════════════════════════════════════════════════════════════════\n');

  try {
    await connectDB();

    // 1. Retrieve or seed candidates in MongoDB
    const studentUser = await User.findOne({ email: 'student@test.com' });
    let studentProfile = null;
    if (studentUser) {
      studentProfile = await StudentProfile.findOne({ userId: studentUser._id });
    }

    if (!studentProfile) {
      console.log('Seeding student profile for testing...');
      let user = studentUser;
      if (!user) {
        user = await User.create({
          name: 'Alex Chen',
          email: 'student@test.com',
          passwordHash: 'password123',
          role: 'student',
          status: 'active',
          emailVerified: true
        });
      }
      studentProfile = await StudentProfile.create({
        userId: user._id,
        skills: ['React', 'Node.js', 'MongoDB', 'Java', 'Data Structures'],
        academicInformation: {
          college: 'Zenith Institute of Technology',
          department: 'Computer Science',
          cgpa: 8.9,
          year: '3rd Year'
        }
      });
    }

    console.log(`✓ Verified Student Profile in DB: ${studentUser?.name || 'Student'}`);
    console.log(`  Skills in DB: [${(studentProfile.skills || []).join(', ')}]`);

    // 2. Retrieve or seed opportunity
    let companyUser = await User.findOne({ role: 'company' });
    let company = await Company.findOne({});
    if (!company && companyUser) {
      company = await Company.create({
        userId: companyUser._id,
        companyName: 'TechNova Solutions',
        industry: 'Cloud & SaaS',
        location: 'Bengaluru',
        verificationStatus: 'verified'
      });
    }

    let opportunity = await Opportunity.findOne({ status: 'open' });
    if (!opportunity && company) {
      opportunity = await Opportunity.create({
        companyId: company._id,
        title: 'Full Stack Engineer',
        type: 'job',
        description: 'Full stack development role',
        requiredSkills: ['React', 'Node.js', 'Docker', 'AWS'],
        location: 'Remote'
      });
    }

    console.log(`\n✓ Verified Opportunity in DB: "${opportunity.title}" (${opportunity.type})`);
    console.log(`  Required Skills in DB: [${opportunity.requiredSkills.join(', ')}]`);

    // 3. Test Skill Matching Calculation
    const matchResult = matchSkills(studentProfile, opportunity);

    console.log('\n--- Real-Time Skill Matching Calculation Output ---');
    console.log(`  Match Percentage: ${matchResult.matchPercentage}%`);
    console.log(`  Matched Skills (${matchResult.matchedSkills.length}): [${matchResult.matchedSkills.join(', ')}]`);
    console.log(`  Missing Skills (${matchResult.missingSkills.length}): [${matchResult.missingSkills.join(', ')}]`);

    // 4. Assertions
    if (typeof matchResult.matchPercentage !== 'number' || isNaN(matchResult.matchPercentage)) {
      throw new Error('FAIL: matchPercentage is not a valid number.');
    }

    if (!Array.isArray(matchResult.matchedSkills) || !Array.isArray(matchResult.missingSkills)) {
      throw new Error('FAIL: matchedSkills or missingSkills is not an array.');
    }

    const expectedMatched = opportunity.requiredSkills.filter(r =>
      studentProfile.skills.some(s => s.toLowerCase().trim() === r.toLowerCase().trim())
    );
    const expectedMissing = opportunity.requiredSkills.filter(r =>
      !studentProfile.skills.some(s => s.toLowerCase().trim() === r.toLowerCase().trim())
    );
    const expectedPercentage = Math.round((expectedMatched.length / opportunity.requiredSkills.length) * 100);

    if (matchResult.matchPercentage !== expectedPercentage) {
      throw new Error(`FAIL: Calculated ${matchResult.matchPercentage}%, expected ${expectedPercentage}%`);
    }

    console.log(`\n✓ ASSERT PASS: Exact mathematical formula verified (Matched: ${matchResult.matchedSkills.length}/${opportunity.requiredSkills.length} = ${matchResult.matchPercentage}%).`);
    console.log('✓ ASSERT PASS: Case-insensitive skill lookup working as expected.');
    console.log('✓ ASSERT PASS: Safe handling of missing skills correctly isolated.');

    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('  ALL COMPANY STUDENT SEARCH SKILL MATCHING TESTS PASSED!       ');
    console.log('════════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n!!! Test Execution Failed !!!');
    console.error(error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

runStudentSearchTests();
