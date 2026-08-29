import './loadEnv.js';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import Company from '../models/Company.js';
import Opportunity from '../models/Opportunity.js';
import AssessmentResult from '../models/AssessmentResult.js';

const testIndustryDemand = async () => {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('       INDUSTRY DEMAND SKILL GAP COMPARISON TEST SUITE          ');
  console.log('════════════════════════════════════════════════════════════════\n');

  try {
    await connectDB();

    const studentUser = await User.findOne({ role: 'student' });
    if (!studentUser) throw new Error('Student user not found.');

    let profile = await StudentProfile.findOne({ userId: studentUser._id });
    if (!profile) {
      profile = await StudentProfile.create({ userId: studentUser._id });
    }

    // Set student skills: React (Advanced), Docker (Beginner)
    profile.skillsList = [
      { name: 'React', category: 'Frontend', proficiency: 'Advanced' },
      { name: 'Docker', category: 'DevOps', proficiency: 'Beginner' }
    ];
    profile.skills = ['React', 'Docker'];
    await profile.save();

    let companyUser = await User.findOne({ role: 'company' });
    let company = await Company.findOne({ userId: companyUser._id });

    // Create 2 test opportunities with React & Docker as required skills to simulate High industry demand
    const opp1 = await Opportunity.create({
      companyId: company._id,
      title: '[TEST-DEMAND-1] Frontend Lead',
      description: 'Lead frontend engineer opening.',
      type: 'job',
      requiredSkills: ['React', 'JavaScript', 'Docker'],
      location: 'Remote',
      status: 'open'
    });

    const opp2 = await Opportunity.create({
      companyId: company._id,
      title: '[TEST-DEMAND-2] Cloud Engineer',
      description: 'Cloud architect opening.',
      type: 'job',
      requiredSkills: ['React', 'Docker', 'Kubernetes'],
      location: 'Remote',
      status: 'open'
    });

    const req = {
      user: { id: studentUser._id },
      query: { opportunityId: opp1._id.toString() },
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

    console.log('── Real Industry Demand Comparison Output:');
    const comp = jsonResult.industryDemandComparison;
    if (!comp || comp.length === 0) {
      throw new Error('FAIL: industryDemandComparison is empty!');
    }

    comp.forEach((item) => {
      console.log(`• Skill: ${item.skill}`);
      console.log(`  - Industry Demand: ${item.demandLevel} (${item.demandCount} Postings)`);
      console.log(`  - Student Skill Level: ${item.studentLevel}`);
      console.log(`  - Skill Gap: ${item.gap}`);
    });

    // Verify React has High demand and Low gap (Student has Advanced)
    const reactItem = comp.find(i => i.skill.toLowerCase() === 'react');
    if (!reactItem || reactItem.gap !== 'Low') {
      throw new Error(`FAIL: React gap expectation mismatch. Got: ${JSON.stringify(reactItem)}`);
    }

    // Verify Docker has High demand and High gap (Student has Beginner)
    const dockerItem = comp.find(i => i.skill.toLowerCase() === 'docker');
    if (!dockerItem || dockerItem.gap !== 'High') {
      throw new Error(`FAIL: Docker gap expectation mismatch. Got: ${JSON.stringify(dockerItem)}`);
    }

    // Clean up test records
    await Opportunity.deleteMany({ _id: { $in: [opp1._id, opp2._id] } });

    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('    INDUSTRY DEMAND COMPARISON TEST PASSED (100%)               ');
    console.log('════════════════════════════════════════════════════════════════\n');

  } catch (err) {
    console.error('\n!!! Industry Demand Test Failed !!!');
    console.error(err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

testIndustryDemand();
