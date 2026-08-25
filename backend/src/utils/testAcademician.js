import mongoose from 'mongoose';
import User from '../models/User.js';
import Company from '../models/Company.js';
import Opportunity from '../models/Opportunity.js';
import { loadEnv } from './loadEnv.js';

loadEnv(import.meta.url);

const runAcademicianTests = async () => {
  console.log('--- Starting Academician Collaboration Integration Tests ---\n');

  try {
    const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillnexus_ai';
    await mongoose.connect(dbUri);
    console.log('[1/5] Connected to MongoDB database successfully.');

    // 1. Clean up old records
    const companyEmail = 'recruiter_acad@sih.in';
    await User.deleteMany({ email: companyEmail });
    console.log('[2/5] Cleaned up previous academician integration test users.');

    // 2. Create Company Recruiter
    const companyUser = await User.create({
      name: 'NVIDIA Research Lab',
      email: companyEmail,
      passwordHash: 'NvidiaPass123!',
      role: 'company',
      status: 'active'
    });

    const company = await Company.findOne({ userId: companyUser._id });
    company.verificationStatus = 'verified';
    await company.save();
    console.log('[3/5] ASSERT PASS: Corporate user registered and verified.');

    // 3. Post FDP & Research opportunities
    const fdpOpp = await Opportunity.create({
      companyId: company._id,
      title: 'Deep Learning & GPU Computing Faculty Seminar',
      type: 'fdp',
      description: 'Hands-on faculty development training for AI infrastructure.',
      requiredSkills: ['AI', 'PyTorch', 'GPU Architecture'],
      location: 'NVIDIA Bengaluru HQ',
      duration: '2 Weeks'
    });

    const researchOpp = await Opportunity.create({
      companyId: company._id,
      title: 'Consultancy Proposal: Parallel Processing Optimizations',
      type: 'research',
      description: 'Collaborative industry consultancy project mapping CUDA kernels.',
      requiredSkills: ['CUDA', 'C++', 'Parallel Algorithms'],
      location: 'Remote',
      stipend: '₹5,000,000 Grant',
      duration: '1 Year'
    });

    console.log('[4/5] ASSERT PASS: Successfully posted FDP and Collaborative Research project.');

    // 4. Query all open opportunities and filter client-side (simulating dashboard logic)
    console.log('[5/5] Querying listings database...');
    const allOpps = await Opportunity.find({ status: 'open' }).populate('companyId', 'companyName');

    const fdps = allOpps.filter(o => o.type === 'fdp');
    const projects = allOpps.filter(o => o.type === 'research');

    if (fdps.length > 0 && fdps[0].companyId.companyName === 'NVIDIA Research Lab') {
      console.log('      ASSERT PASS: Successfully queried FDP opportunity populated with company details.');
    } else {
      throw new Error('FAIL: Mismatch in FDP query results.');
    }

    if (projects.length > 0 && projects[0].companyId.companyName === 'NVIDIA Research Lab') {
      console.log('      ASSERT PASS: Successfully queried Research Project opportunity populated with company details.');
    } else {
      throw new Error('FAIL: Mismatch in Research Project query results.');
    }

    console.log('\n--- All Academician Collaboration Catalog Tests PASSED successfully! ---');

  } catch (error) {
    console.error('\n!!! Academician Collaboration Test FAILED !!!');
    console.error(error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB. Testing session closed.');
  }
};

runAcademicianTests();
