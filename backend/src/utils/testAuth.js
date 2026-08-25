const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const runTests = async () => {
  console.log('--- Starting Authentication Integration Tests ---\n');
  
  try {
    // 1. Connect to DB
    const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sih26044';
    await mongoose.connect(dbUri);
    console.log('[1/5] Connected to MongoDB database successfully.');

    // 2. Clean up existing test user
    const testEmail = 'test_student@sih.in';
    await User.deleteMany({ email: testEmail });
    console.log(`[2/5] Cleaned up any old test users with email: ${testEmail}`);

    // 3. Test Registration Hashing Hook
    const rawPassword = 'SecurePassword123!';
    const user = await User.create({
      name: 'SIH Test Student',
      email: testEmail,
      passwordHash: rawPassword, // Will be intercepted and hashed by pre-save hook
      role: 'student',
      status: 'active'
    });

    console.log('[3/5] User registered successfully.');
    console.log(`      Raw password input: "${rawPassword}"`);
    console.log(`      Stored passwordHash in DB: "${user.passwordHash}"`);

    // Verify it was hashed and is not stored in plain text
    if (user.passwordHash === rawPassword) {
      throw new Error('FAIL: Password is saved in plain text! Pre-save hashing failed.');
    } else {
      console.log('      ASSERT PASS: Password successfully hashed in DB.');
    }

    // 4. Test Password Verification Method
    console.log('[4/5] Testing password verification method...');
    const userWithPass = await User.findOne({ email: testEmail }).select('+passwordHash');
    
    // Correct Password
    const correctMatch = await userWithPass.matchPassword(rawPassword);
    if (correctMatch) {
      console.log('      ASSERT PASS: Correct password matches database hash.');
    } else {
      throw new Error('FAIL: Correct password was rejected by matchPassword.');
    }

    // Incorrect Password
    const incorrectMatch = await userWithPass.matchPassword('WrongPassword123');
    if (!incorrectMatch) {
      console.log('      ASSERT PASS: Incorrect password successfully rejected.');
    } else {
      throw new Error('FAIL: Incorrect password was accepted by matchPassword.');
    }

    // 5. Test Email Uniqueness Constraint
    console.log('[5/5] Testing email uniqueness constraint...');
    try {
      await User.create({
        name: 'Duplicate Student',
        email: testEmail,
        passwordHash: 'AnotherPassword',
        role: 'student'
      });
      throw new Error('FAIL: Database allowed registering a user with a duplicate email address.');
    } catch (err) {
      if (err.code === 11000) {
        console.log('      ASSERT PASS: Database rejected duplicate email successfully (Duplicate Key 11000).');
      } else {
        throw err;
      }
    }

    console.log('\n--- All Authentication Tests PASSED successfully! ---');

  } catch (error) {
    console.error('\n!!! Authentication Test FAILED !!!');
    console.error(error.message);
  } finally {
    // Disconnect DB
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB. Testing session closed.');
  }
};

runTests();
