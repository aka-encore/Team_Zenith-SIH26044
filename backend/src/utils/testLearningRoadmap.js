import './loadEnv.js';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import Company from '../models/Company.js';
import Opportunity from '../models/Opportunity.js';
import AssessmentResult from '../models/AssessmentResult.js';

const testLearningRoadmap = async () => {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('          DYNAMIC LEARNING ROADMAP TEST SUITE                   ');
  console.log('════════════════════════════════════════════════════════════════\n');

  try {
    await connectDB();

    const studentUser = await User.findOne({ role: 'student' });
    if (!studentUser) throw new Error('Student user not found.');

    let profile = await StudentProfile.findOne({ userId: studentUser._id });
    if (!profile) {
      profile = await StudentProfile.create({ userId: studentUser._id });
    }

    profile.skillsList = [
      { name: 'React', category: 'Frontend', proficiency: 'Advanced' },
      { name: 'JavaScript', category: 'Languages', proficiency: 'Advanced' },
      { name: 'Node.js', category: 'Backend', proficiency: 'Beginner' } // Weak Skill
    ];
    profile.skills = ['React', 'JavaScript', 'Node.js'];
    await profile.save();

    // Find or create company
    let companyUser = await User.findOne({ role: 'company' });
    let company = await Company.findOne({ userId: companyUser._id });

    // Create a sample test opportunity with required skills
    let testOpp = await Opportunity.findOne({ title: '[TEST-ROADMAP] Full Stack Cloud Engineer' });
    if (!testOpp) {
      testOpp = await Opportunity.create({
        companyId: company._id,
        title: '[TEST-ROADMAP] Full Stack Cloud Engineer',
        description: 'Full Stack Cloud Engineer recruitment drive for developers.',
        type: 'job',
        requiredSkills: ['React', 'JavaScript', 'Node.js', 'Docker', 'AWS'], // Docker & AWS are missing
        location: 'Remote',
        status: 'open'
      });
    }

    // Record an assessment result with low score
    await AssessmentResult.deleteMany({ userId: studentUser._id, skill: 'DSA' });
    await AssessmentResult.create({
      userId: studentUser._id,
      skill: 'DSA',
      totalQuestions: 5,
      correctAnswers: 2,
      wrongAnswers: 3,
      score: 2,
      percentage: 40,
      scorePercentage: 40,
      passed: false,
      skillLevel: 'Beginner',
      proficiencyEarned: 'Beginner'
    });

    // Test API calculation
    const req = {
      user: { id: studentUser._id },
      query: { opportunityId: testOpp._id.toString() },
      body: {}
    };

    let jsonResult = null;
    let statusCode = null;

    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => {
            jsonResult = data;
          }
        };
      }
    };

    const { getSkillGapAnalysis } = await import('../controllers/studentController.js');
    await getSkillGapAnalysis(req, res);

    if (statusCode !== 200 || !jsonResult.success) {
      throw new Error(`Failed to compute skill gap: ${JSON.stringify(jsonResult)}`);
    }

    console.log(`✓ Target Role Analyzed: "${jsonResult.selectedOpportunity?.title}"`);
    console.log(`✓ Match Percentage: ${jsonResult.matchPercentage}%`);
    console.log(`✓ Matched Skills: [${jsonResult.matchedSkills.join(', ')}]`);
    console.log(`✓ Missing Skills: [${jsonResult.missingSkills.join(', ')}]`);
    console.log(`✓ Weak Skills: [${jsonResult.weakSkills.map(w => w.name + ' (' + w.proficiency + ')').join(', ')}]`);

    console.log('\n── Dynamic Learning Roadmap (Recommended Learning Order):');
    if (!jsonResult.learningRoadmap || jsonResult.learningRoadmap.length === 0) {
      throw new Error('FAIL: Learning roadmap is empty!');
    }

    jsonResult.learningRoadmap.forEach((item) => {
      console.log(`  ${item.step}. ${item.skill}`);
      console.log(`     Priority: ${item.priority}`);
      console.log(`     Reason: ${item.reason}`);
      console.log(`     Levels: ${item.currentLevel} → ${item.targetLevel}`);
    });

    // Clean up test opportunity and assessment
    await Opportunity.deleteMany({ _id: testOpp._id });
    await AssessmentResult.deleteMany({ userId: studentUser._id, skill: 'DSA' });

    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('       LEARNING ROADMAP ENGINE TEST PASSED (100%)               ');
    console.log('════════════════════════════════════════════════════════════════\n');

  } catch (err) {
    console.error('\n!!! Learning Roadmap Test Failed !!!');
    console.error(err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

testLearningRoadmap();
