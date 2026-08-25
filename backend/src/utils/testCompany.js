import mongoose from 'mongoose';
import User from '../models/User.js';
import Company from '../models/Company.js';
import { loadEnv } from './loadEnv.js';

loadEnv(import.meta.url);

const runCompanyTests = async () => {
  console.log('--- Starting Company Profile Integration Tests ---\n');

  try {
    const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sih26044';
    await mongoose.connect(dbUri);
    console.log('[1/5] Connected to MongoDB database successfully.');

    // 1. Clean up test users
    const testEmail = 'company_test_user@sih.in';
    await User.deleteMany({ email: testEmail });
    console.log('[2/5] Cleaned old company test records.');

    // 2. Register user to trigger auto-creation
    const user = await User.create({
      name: 'Initial Company Name Inc.',
      email: testEmail,
      passwordHash: 'Password123!',
      role: 'company',
      status: 'pending' // Companies default to pending until verified
    });
    
    // Check if registration hook successfully instantiated Company Profile
    const initialProfile = await Company.findOne({ userId: user._id });
    if (!initialProfile) {
      throw new Error('FAIL: Company registered but default Company profile document was not created!');
    } else {
      console.log('[3/5] ASSERT PASS: Company registration successfully auto-instantiated default Company profile document.');
      console.log(`      Initial Company Name: "${initialProfile.companyName}"`);
      console.log(`      Initial Verification Status: "${initialProfile.verificationStatus}"`);
    }

    // 3. Test Profile Update persistence
    console.log('[4/5] Executing profile updates...');
    const updatedName = 'Microsoft India Ltd.';
    const industry = 'Information Technology';
    const description = 'Cloud computing and developer tooling operations.';
    const website = 'https://www.microsoft.com/en-in';
    const location = 'Hyderabad, Telangana';

    initialProfile.companyName = updatedName;
    initialProfile.industry = industry;
    initialProfile.description = description;
    initialProfile.website = website;
    initialProfile.location = location;
    await initialProfile.save();

    // Also sync user name (simulates controller action)
    await User.findByIdAndUpdate(user._id, { name: updatedName });

    // Re-query from DB to verify it saved
    const updated = await Company.findOne({ userId: user._id }).populate('userId', 'name email');
    
    if (
      updated.companyName === updatedName &&
      updated.userId.name === updatedName &&
      updated.industry === industry &&
      updated.location === location &&
      updated.website === website
    ) {
      console.log('      ASSERT PASS: Company profile fields and User name sync successfully persisted in MongoDB.');
    } else {
      throw new Error('FAIL: Saved company profile values do not match query verification.');
    }

    // 4. Test Populated fields
    console.log('[5/5] Testing populated query references...');
    if (updated.userId && updated.userId.email === testEmail) {
      console.log('      ASSERT PASS: Populate query retrieves related User details successfully.');
    } else {
      throw new Error('FAIL: Populated fields are missing or user details mismatch.');
    }

    console.log('\n--- All Company Profile Tests PASSED successfully! ---');

  } catch (error) {
    console.error('\n!!! Company Profile Test FAILED !!!');
    console.error(error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB. Testing session closed.');
  }
};

runCompanyTests();
