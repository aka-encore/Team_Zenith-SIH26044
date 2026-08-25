import mongoose from 'mongoose';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import { loadEnv } from './loadEnv.js';

loadEnv(import.meta.url);

const runProfileTests = async () => {
  console.log('--- Starting Student Profile Integration Tests ---\n');

  try {
    const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillnexus_ai';
    await mongoose.connect(dbUri);
    console.log('[1/5] Connected to MongoDB database successfully.');

    // 1. Clean up test users
    const testEmail = 'profile_test_student@sih.in';
    await User.deleteMany({ email: testEmail });
    // Keep profiles clean
    console.log('[2/5] Cleaned old profile test records.');

    // 2. Register user to trigger auto-creation
    const user = await User.create({
      name: 'Onboarding Tester',
      email: testEmail,
      passwordHash: 'Password123!',
      role: 'student',
      status: 'active'
    });
    
    // Check if registration hook successfully instantiated StudentProfile
    const initialProfile = await StudentProfile.findOne({ userId: user._id });
    if (!initialProfile) {
      throw new Error('FAIL: User registered but default StudentProfile document was not created!');
    } else {
      console.log('[3/5] ASSERT PASS: Student registration successfully auto-instantiated default StudentProfile document.');
    }

    // 3. Test Profile Update persistence
    console.log('[4/5] Executing profile updates...');
    const academicInformation = {
      college: 'SIH Technical University',
      degree: 'B.Tech IT',
      branch: 'Information Technology',
      year: 3,
      cgpa: 9.15
    };
    const skills = ['JavaScript', 'HTML', 'CSS', 'Node.js'];
    const softSkills = ['Teamwork', 'Presentation'];
    const resumeUrl = 'https://drive.google.com/resume_tester';

    initialProfile.academicInformation = academicInformation;
    initialProfile.skills = skills;
    initialProfile.softSkills = softSkills;
    initialProfile.resumeUrl = resumeUrl;
    await initialProfile.save();

    // Re-query from DB to verify it saved
    const updated = await StudentProfile.findOne({ userId: user._id });
    
    if (
      updated.academicInformation.college === academicInformation.college &&
      updated.skills.includes('Node.js') &&
      updated.resumeUrl === resumeUrl
    ) {
      console.log('      ASSERT PASS: StudentProfile fields successfully updated and persisted in MongoDB.');
    } else {
      throw new Error('FAIL: Saved profile values do not match query verification.');
    }

    // 4. Test Populated fields
    console.log('[5/5] Testing populated query references...');
    const populated = await StudentProfile.findOne({ userId: user._id }).populate('userId', 'name email role');
    
    if (populated.userId && populated.userId.name === 'Onboarding Tester' && populated.userId.email === testEmail) {
      console.log('      ASSERT PASS: Populate query retrieves related User details successfully.');
    } else {
      throw new Error('FAIL: Populated fields are missing or user details mismatch.');
    }

    console.log('\n--- All Student Profile Tests PASSED successfully! ---');

  } catch (error) {
    console.error('\n!!! Student Profile Test FAILED !!!');
    console.error(error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB. Testing session closed.');
  }
};

runProfileTests();
