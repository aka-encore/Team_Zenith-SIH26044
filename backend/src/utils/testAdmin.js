const mongoose = require('mongoose');
const User = require('../models/User');
const Company = require('../models/Company');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const runAdminModerationTests = async () => {
  console.log('--- Starting Corporate Moderation (Admin) Integration Tests ---\n');

  try {
    const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sih26044';
    await mongoose.connect(dbUri);
    console.log('[1/5] Connected to MongoDB database successfully.');

    // 1. Clean up old records
    const testEmail = 'verify_company@corporate.in';
    await User.deleteMany({ email: testEmail });
    console.log('[2/5] Cleaned up previous moderation test users.');

    // 2. Register Company User
    const user = await User.create({
      name: 'Unverified Startup Inc.',
      email: testEmail,
      passwordHash: 'StartupPassword123!',
      role: 'company',
      status: 'active'
    });

    // 3. Find and check default pending status
    const company = await Company.findOne({ userId: user._id });
    if (!company) {
      throw new Error('FAIL: Company registered but profile document was not created!');
    }
    
    if (company.verificationStatus === 'pending') {
      console.log('[3/5] ASSERT PASS: Default registration status is "pending".');
    } else {
      throw new Error(`FAIL: Default registration status is "${company.verificationStatus}", expected "pending".`);
    }

    // 4. Moderate: Approve Company
    company.verificationStatus = 'verified';
    await company.save();

    const verifiedCheck = await Company.findById(company._id);
    if (verifiedCheck.verificationStatus === 'verified') {
      console.log('[4/5] ASSERT PASS: Admin successfully set company status to "verified".');
    } else {
      throw new Error('FAIL: Failed to toggle company verification status to verified.');
    }

    // 5. Moderate: Reject Company
    company.verificationStatus = 'rejected';
    await company.save();

    const rejectedCheck = await Company.findById(company._id);
    if (rejectedCheck.verificationStatus === 'rejected') {
      console.log('[5/5] ASSERT PASS: Admin successfully set company status to "rejected".');
    } else {
      throw new Error('FAIL: Failed to toggle company verification status to rejected.');
    }

    console.log('\n--- All Admin Moderation Dashboard Tests PASSED successfully! ---');

  } catch (error) {
    console.error('\n!!! Admin Moderation Test FAILED !!!');
    console.error(error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB. Testing session closed.');
  }
};

runAdminModerationTests();
