import mongoose from 'mongoose';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import Company from '../models/Company.js';
import Opportunity from '../models/Opportunity.js';
import Application from '../models/Application.js';
import { loadEnv } from './loadEnv.js';

loadEnv(import.meta.url);

const runApplicationTests = async () => {
  console.log('--- Starting Placements Application Integration Tests ---\n');

  try {
    const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillnexus_ai';
    await mongoose.connect(dbUri);
    console.log('[1/6] Connected to MongoDB database successfully.');

    // 1. Clean up old records
    const studentEmail = 'applicant_student@sih.in';
    const companyEmail = 'recruiter_placements@sih.in';
    await User.deleteMany({ email: { $in: [studentEmail, companyEmail] } });
    console.log('[2/6] Cleaned up previous application test users.');

    // 2. Register Recruiter and Student
    const companyUser = await User.create({
      name: 'Google India recruiter',
      email: companyEmail,
      passwordHash: 'GooglePass123!',
      role: 'company',
      status: 'active'
    });

    const studentUser = await User.create({
      name: 'B.Tech Star Candidate',
      email: studentEmail,
      passwordHash: 'StudentPass123!',
      role: 'student',
      status: 'active'
    });

    // Verify auto-creations
    const company = await Company.findOne({ userId: companyUser._id });
    company.verificationStatus = 'verified';
    await company.save();

    const student = await StudentProfile.findOne({ userId: studentUser._id });
    student.academicInformation = {
      college: 'SIH Academy',
      degree: 'B.Tech IT',
      branch: 'Information Technology',
      year: 4,
      cgpa: 9.85
    };
    student.resumeUrl = 'https://drive.google.com/test_resume_url';
    await student.save();

    console.log('[3/6] ASSERT PASS: Recruiter company verified and student profile academic records initialized.');

    // 3. Recruiter posts opportunity
    const opp = await Opportunity.create({
      companyId: company._id,
      title: 'Systems Development Intern',
      type: 'internship',
      description: 'C++ Systems infrastructure engineering intern role.',
      requiredSkills: ['C++', 'Rust', 'Operating Systems'],
      location: 'Bengaluru, India',
      stipend: '₹50,000 / month',
      duration: '6 months'
    });
    console.log('[4/6] ASSERT PASS: Recruiter successfully posted Systems Development Intern opportunity.');

    // 4. Student submits application
    const app = await Application.create({
      opportunityId: opp._id,
      studentId: student._id,
      resumeUrl: student.resumeUrl,
      coverLetter: 'I am highly passionate about low-level hardware-level optimization details.'
    });
    console.log('[5/6] ASSERT PASS: Student submitted placement application successfully.');

    // Test compound index unique locks (duplicate prevention)
    try {
      await Application.create({
        opportunityId: opp._id,
        studentId: student._id,
        resumeUrl: student.resumeUrl,
        coverLetter: 'Duplicate attempt'
      });
      throw new Error('FAIL: Duplicate application created! Unique index constraints are bypassed.');
    } catch (err) {
      if (err.code === 11000) {
        console.log('      ASSERT PASS: Duplicate application blocked by MongoDB compound unique index locks.');
      } else {
        throw err;
      }
    }

    // 5. Recruiter modifies application status
    console.log('[6/6] Executing recruitment candidate evaluation...');
    app.status = 'shortlisted';
    await app.save();

    // Query from student side to verify status update propagates correctly
    const studentSideQuery = await Application.findOne({ studentId: student._id })
      .populate('opportunityId', 'title')
      .populate({
        path: 'opportunityId',
        populate: { path: 'companyId', select: 'companyName' }
      });

    if (
      studentSideQuery.status === 'shortlisted' &&
      studentSideQuery.opportunityId.companyId.companyName === 'Google India recruiter'
    ) {
      console.log('      ASSERT PASS: Candidate status update "shortlisted" successfully synced on Student application logs.');
    } else {
      throw new Error('FAIL: Application status update mismatch or company name mapping failure.');
    }

    console.log('\n--- All Placements Application Module Tests PASSED successfully! ---');

  } catch (error) {
    console.error('\n!!! Placement Application Integration Test FAILED !!!');
    console.error(error.stack || error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB. Testing session closed.');
  }
};

runApplicationTests();
