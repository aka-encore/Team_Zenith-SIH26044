import './loadEnv.js';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import StudentProfile from '../models/StudentProfile.js';
import Opportunity from '../models/Opportunity.js';
import Company from '../models/Company.js';
import User from '../models/User.js';
import { matchSkills } from './matchingEngine.js';

const runSkillGapIntegrationTest = async () => {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('      SKILL GAP REAL DATABASE INTEGRATION TEST SUITE            ');
  console.log('════════════════════════════════════════════════════════════════\n');

  try {
    await connectDB();

    // 1. Find or verify student user and profile in MongoDB
    const studentUser = await User.findOne({ role: 'student' });
    if (!studentUser) {
      throw new Error('FAIL: No student user found in database.');
    }

    let profile = await StudentProfile.findOne({ userId: studentUser._id });
    if (!profile) {
      profile = await StudentProfile.create({
        userId: studentUser._id,
        skillsList: [
          { name: 'React', category: 'Frontend', proficiency: 'Advanced' },
          { name: 'Node.js', category: 'Backend', proficiency: 'Intermediate' },
          { name: 'MongoDB', category: 'Database', proficiency: 'Beginner' }
        ],
        skills: ['React', 'Node.js', 'MongoDB']
      });
    }

    console.log(`✓ [1/5] Verified Student Profile in DB: ${studentUser.name}`);
    const currentSkills = (profile.skillsList && profile.skillsList.length > 0)
      ? profile.skillsList.map(s => `${s.name} (${s.proficiency})`)
      : (profile.skills || []);
    console.log(`      Current Skills: [${currentSkills.join(', ')}]`);

    // 2. Find or verify Opportunity in MongoDB
    let opp = await Opportunity.findOne({ status: 'open' });
    if (!opp) {
      let company = await Company.findOne({});
      if (!company) {
        const companyUser = await User.findOne({ role: 'company' });
        company = await Company.create({
          userId: companyUser._id,
          companyName: 'CloudSphere Inc',
          industry: 'Enterprise Software',
          location: 'Bengaluru',
          verificationStatus: 'verified'
        });
      }
      opp = await Opportunity.create({
        companyId: company._id,
        title: 'Full Stack Cloud Developer',
        type: 'job',
        description: 'Full stack role description',
        requiredSkills: ['React', 'Node.js', 'MongoDB', 'Docker', 'AWS'],
        location: 'Remote'
      });
    }

    console.log(`\n✓ [2/5] Verified Opportunity in DB: "${opp.title}"`);
    console.log(`      Required Skills: [${opp.requiredSkills.join(', ')}]`);

    // 3. Compute Skill Matching Engine Results
    const match = matchSkills(profile, opp);
    console.log('\n✓ [3/5] Skill Matching Engine Execution:');
    console.log(`      Match Percentage: ${match.matchPercentage}%`);
    console.log(`      Matched Skills: [${match.matchedSkills.join(', ')}]`);
    console.log(`      Missing Skills: [${match.missingSkills.join(', ')}]`);

    // 4. Identify Weak Skills
    const targetSet = new Set(opp.requiredSkills.map(s => s.toLowerCase().trim()));
    const weakSkills = (profile.skillsList || []).filter(s =>
      (s.proficiency || '').toLowerCase() === 'beginner' && targetSet.has(s.name.toLowerCase().trim())
    );
    console.log(`\n✓ [4/5] Weak Skills Analysis:`);
    console.log(`      Weak Skills Found (${weakSkills.length}): [${weakSkills.map(w => `${w.name} (${w.proficiency})`).join(', ')}]`);

    // 5. Build Recommendations
    const recommendedSkills = match.missingSkills.map(sk => ({
      skill: sk,
      reason: 'Required for selected target opening',
      priority: 'High'
    }));
    console.log(`\n✓ [5/5] Recommended Skills Roadmap:`);
    recommendedSkills.forEach((r, idx) => {
      console.log(`      Phase ${idx + 1}: ${r.skill} (${r.reason}) [Priority: ${r.priority}]`);
    });

    // 6. Assertions
    if (typeof match.matchPercentage !== 'number' || isNaN(match.matchPercentage)) {
      throw new Error('FAIL: matchPercentage is not a valid number.');
    }
    if (!match.matchedSkills.includes('React') || !match.matchedSkills.includes('Node.js')) {
      throw new Error('FAIL: Matched skills do not contain expected React & Node.js.');
    }
    if (!match.missingSkills.includes('Docker') || !match.missingSkills.includes('AWS')) {
      throw new Error('FAIL: Missing skills do not contain expected Docker & AWS.');
    }

    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('   ALL SKILL GAP REAL DATABASE INTEGRATION TESTS PASSED!        ');
    console.log('════════════════════════════════════════════════════════════════\n');

  } catch (err) {
    console.error('\n!!! Skill Gap Integration Test Failed !!!');
    console.error(err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

runSkillGapIntegrationTest();
