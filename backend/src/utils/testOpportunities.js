import mongoose from 'mongoose';
import User from '../models/User.js';
import Company from '../models/Company.js';
import Opportunity from '../models/Opportunity.js';
import { loadEnv } from './loadEnv.js';

loadEnv(import.meta.url);

const runOpportunityTests = async () => {
  console.log('--- Starting Opportunity Module Integration Tests ---\n');

  try {
    const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sih26044';
    await mongoose.connect(dbUri);
    console.log('[1/6] Connected to MongoDB database successfully.');

    // 1. Clean up old test data
    const companyEmail = 'recruiter_test@corporate.com';
    await User.deleteMany({ email: companyEmail });
    console.log('[2/6] Cleaned old recruitment test records.');

    // 2. Register Company User
    const user = await User.create({
      name: 'SuperTech Solutions Ltd.',
      email: companyEmail,
      passwordHash: 'RecruiterSecure123!',
      role: 'company',
      status: 'active'
    });

    // 3. Find and verify default Company profile is auto-created
    const company = await Company.findOne({ userId: user._id });
    if (!company) {
      throw new Error('FAIL: Company registered but Company profile document was not created!');
    }
    console.log('[3/6] ASSERT PASS: Company Profile successfully auto-instantiated.');
    
    // Simulate approval by admin (verify company status)
    company.verificationStatus = 'verified';
    company.industry = 'Information Technology';
    company.location = 'Bengaluru, India';
    await company.save();
    console.log('      Simulated admin verification. Company status updated to "verified".');

    // 4. Create Opportunity
    console.log('[4/6] Creating opportunities...');
    const opp = await Opportunity.create({
      companyId: company._id,
      title: 'Full Stack Node/React Developer',
      type: 'internship',
      description: 'Join our development team to build next-generation web application layers.',
      requiredSkills: ['React', 'Node.js', 'Express', 'MongoDB'],
      location: 'Remote',
      stipend: '₹25,000 / month',
      duration: '6 months'
    });

    if (!opp) {
      throw new Error('FAIL: Failed to create opportunity posting document.');
    }
    console.log('      ASSERT PASS: Opportunity posted and linked to Company ID successfully.');

    // 5. Query and filter opportunities
    console.log('[5/6] Testing query filters and populations...');
    // Query with skill matching
    const queried = await Opportunity.find({
      status: 'open',
      requiredSkills: { $in: [new RegExp('^react$', 'i')] }
    }).populate('companyId', 'companyName industry');

    if (queried.length > 0 && queried[0].companyId.companyName === 'SuperTech Solutions Ltd.') {
      console.log('      ASSERT PASS: Successfully queried opportunity by skill filter with company details populated.');
    } else {
      throw new Error('FAIL: Query filter by skill failed or company details are unpopulated.');
    }

    // 6. Test Update & Close flows
    console.log('[6/6] Testing opportunity update and closure...');
    opp.status = 'closed';
    await opp.save();

    const closedCheck = await Opportunity.findById(opp._id);
    if (closedCheck.status === 'closed') {
      console.log('      ASSERT PASS: Opportunity status successfully updated to "closed".');
    } else {
      throw new Error('FAIL: Failed to update opportunity status to closed.');
    }

    console.log('\n--- All Opportunity Placements Tests PASSED successfully! ---');

  } catch (error) {
    console.error('\n!!! Opportunity Module Test FAILED !!!');
    console.error(error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB. Testing session closed.');
  }
};

runOpportunityTests();
