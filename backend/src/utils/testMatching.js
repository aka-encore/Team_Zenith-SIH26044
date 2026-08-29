import './loadEnv.js';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import StudentProfile from '../models/StudentProfile.js';
import Opportunity from '../models/Opportunity.js';
import Company from '../models/Company.js';
import User from '../models/User.js';
import { 
  matchSkills, 
  extractStudentSkills, 
  extractOpportunitySkills, 
  matchStudentWithOpportunities,
  matchOpportunityWithStudents,
  analyzeSkillGap
} from './matchingEngine.js';

const runTests = async () => {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('       SKILL MATCHING ENGINE: COMPREHENSIVE TEST SUITE          ');
  console.log('════════════════════════════════════════════════════════════════\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      if (details) console.error(`    Details: ${details}`);
      failed++;
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 1. UNIT TESTS
  // ─────────────────────────────────────────────────────────────
  console.log('--- 1. Case-Insensitive Matching & Calculation ---');
  const student1 = {
    skillsList: [
      { name: 'React', proficiency: 'Expert' },
      { name: 'Node.js', proficiency: 'Intermediate' },
      { name: 'MongoDB', proficiency: 'Intermediate' },
      { name: 'Python', proficiency: 'Beginner' }
    ]
  };

  const opportunity1 = {
    title: 'Fullstack Developer',
    requiredSkills: ['react', 'NODE.JS', 'MongoDB', 'Docker'] // 3 matched, 1 missing
  };

  const res1 = matchSkills(student1, opportunity1);
  assert(res1.matchPercentage === 75, 'Match Percentage: 3 matched / 4 required = 75%', `Got ${res1.matchPercentage}%`);
  assert(res1.matchedSkills.length === 3, 'Matched skills count is 3', `Got ${res1.matchedSkills.length}`);
  assert(res1.missingSkills.length === 1 && res1.missingSkills[0] === 'Docker', 'Missing skill is Docker', `Got ${res1.missingSkills}`);

  console.log('\n--- 2. 100% Match Scenario ---');
  const studentFull = {
    skills: ['Java', 'Spring Boot', 'MongoDB', 'C++', 'Microservices', 'Docker']
  };

  const oppFull = {
    requiredSkills: ['java', 'spring boot', 'docker']
  };

  const resFull = matchSkills(studentFull, oppFull);
  assert(resFull.matchPercentage === 100, 'All 3 required skills matched = 100%', `Got ${resFull.matchPercentage}%`);
  assert(resFull.missingSkills.length === 0, 'No missing skills', `Missing: ${resFull.missingSkills}`);

  console.log('\n--- 3. 0% Match Scenario ---');
  const studentZero = {
    skills: ['HTML', 'CSS']
  };

  const oppZero = {
    requiredSkills: ['Go', 'Kubernetes', 'gRPC']
  };

  const resZero = matchSkills(studentZero, oppZero);
  assert(resZero.matchPercentage === 0, '0 matched / 3 required = 0%', `Got ${resZero.matchPercentage}%`);
  assert(resZero.matchedSkills.length === 0, 'Matched skills is empty');
  assert(resZero.missingSkills.length === 3, 'All 3 skills are missing');

  console.log('\n--- 4. Safe Handling of Empty / Missing Data ---');
  const emptyStudent = {};
  const emptyOpp = {};

  const resEmpty1 = matchSkills(emptyStudent, { requiredSkills: ['React'] });
  assert(resEmpty1.matchPercentage === 0, 'Empty student against required skills returns 0% match');
  assert(resEmpty1.missingSkills[0] === 'React', 'Missing skill is properly listed');

  const resEmpty2 = matchSkills({ skills: ['React', 'Node.js'] }, emptyOpp);
  assert(resEmpty2.matchPercentage === 100, 'Student with skills against empty requiredSkills returns 100%');
  assert(resEmpty2.matchedSkills.length === 0 && resEmpty2.missingSkills.length === 0, 'No matched/missing required skills');

  const resNull = matchSkills(null, null);
  assert(resNull.matchPercentage === 100 && resNull.matchedSkills.length === 0, 'null/null handled safely');

  console.log('\n--- 5. Flexible Input Formats ---');
  const studentHybrid = {
    skillsList: [{ name: 'React' }],
    skills: ['Node.js', 'MongoDB'],
    softSkills: ['Leadership']
  };

  const oppString = {
    requiredSkills: 'React, Node.js, AWS'
  };

  const resHybrid = matchSkills(studentHybrid, oppString);
  assert(resHybrid.matchPercentage === 67, '2 of 3 matched = 67%', `Got ${resHybrid.matchPercentage}%`);
  assert(resHybrid.missingSkills[0] === 'AWS', 'Missing skill AWS correctly extracted from string');

  console.log('\n--- 6. Student Opportunities Sorting Utility ---');
  const oppList = [
    { title: 'Low Match Role', requiredSkills: ['C#', '.NET', 'Azure', 'SQL Server'] }, // 0%
    { title: 'High Match Role', requiredSkills: ['React', 'Node.js'] }, // 100%
    { title: 'Medium Match Role', requiredSkills: ['React', 'Python', 'AWS'] } // 50%
  ];

  const matchedOpps = matchStudentWithOpportunities(studentHybrid, oppList);
  assert(matchedOpps[0].title === 'High Match Role', 'Top ranked opportunity is 100% High Match Role');
  assert(matchedOpps[1].title === 'Medium Match Role', 'Second ranked is Medium Match Role');
  assert(matchedOpps[2].title === 'Low Match Role', 'Third ranked is Low Match Role');

  console.log('\n--- 7. Skill Gap Analysis Utility ---');
  const gap = analyzeSkillGap(studentHybrid, {
    requiredSkills: ['React', 'Node.js', 'Docker', 'Kubernetes']
  });

  assert(gap.matchPercentage === 50, 'Gap match percentage is 50%');
  assert(gap.matchedSkills.includes('React') && gap.matchedSkills.includes('Node.js'), 'Matched skills include React & Node.js');
  assert(gap.missingSkills.includes('Docker') && gap.missingSkills.includes('Kubernetes'), 'Missing skills include Docker & Kubernetes');

  // ─────────────────────────────────────────────────────────────
  // 2. REAL DATABASE INTEGRATION TEST
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 8. Real Database Integration Test ---');
  try {
    await connectDB();

    // Query real student profile
    const studentUser = await User.findOne({ role: 'student' });
    if (studentUser) {
      const realStudent = await StudentProfile.findOne({ userId: studentUser._id });
      if (realStudent) {
        console.log(`  Found student profile in DB: ${studentUser.name} (${studentUser.email})`);
        const sSkills = extractStudentSkills(realStudent);
        console.log(`  Student Skills in DB: [${sSkills.join(', ')}]`);

        // Test with real opportunity or mock opportunity
        let realOpp = await Opportunity.findOne({ status: 'open' });
        if (!realOpp) {
          // Find company
          let company = await Company.findOne({});
          if (!company) {
            const companyUser = await User.findOne({ role: 'company' });
            if (companyUser) company = await Company.findOne({ userId: companyUser._id });
          }
          if (company) {
            realOpp = await Opportunity.create({
              companyId: company._id,
              title: 'Backend Systems Engineer',
              type: 'job',
              description: 'Real DB Test Opportunity',
              requiredSkills: ['Node.js', 'MongoDB', 'AWS', 'Docker'],
              location: 'Remote'
            });
          }
        }

        if (realOpp) {
          console.log(`  Evaluating with Opportunity in DB: "${realOpp.title}"`);
          console.log(`  Opportunity Required Skills: [${realOpp.requiredSkills.join(', ')}]`);

          const dbMatch = matchSkills(realStudent, realOpp);
          console.log(`  => Match Percentage: ${dbMatch.matchPercentage}%`);
          console.log(`  => Matched Skills: [${dbMatch.matchedSkills.join(', ')}]`);
          console.log(`  => Missing Skills: [${dbMatch.missingSkills.join(', ')}]`);

          assert(typeof dbMatch.matchPercentage === 'number', 'DB Match percentage is a valid number');
          assert(Array.isArray(dbMatch.matchedSkills), 'DB Matched skills is an array');
          assert(Array.isArray(dbMatch.missingSkills), 'DB Missing skills is an array');
          assert(
            dbMatch.matchedSkills.length + dbMatch.missingSkills.length === realOpp.requiredSkills.length,
            'Matched + Missing equals total required skills'
          );
        }
      }
    }
  } catch (dbErr) {
    console.error('  Database integration check error:', dbErr.message);
  } finally {
    await mongoose.disconnect();
  }

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('════════════════════════════════════════════════════════════════\n');

  if (failed > 0) {
    process.exit(1);
  }
};

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
