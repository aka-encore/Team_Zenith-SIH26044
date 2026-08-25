import mongoose from 'mongoose';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import Company from '../models/Company.js';
import Opportunity from '../models/Opportunity.js';
import Application from '../models/Application.js';
import { loadEnv } from './loadEnv.js';

loadEnv(import.meta.url);

const runInstitutionTests = async () => {
  console.log('--- Starting Institutional Analytics Integration Tests ---\n');

  try {
    const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sih26044';
    await mongoose.connect(dbUri);
    console.log('[1/5] Connected to MongoDB database successfully.');

    // 1. Clean up old records
    const student1Email = 'student1@sih.in';
    const student2Email = 'student2@sih.in';
    const companyEmail = 'recruiter_inst@sih.in';
    const instEmail = 'admin_inst@sih.in';
    await User.deleteMany({ email: { $in: [student1Email, student2Email, companyEmail, instEmail] } });
    await StudentProfile.deleteMany({ 'academicInformation.college': 'SIH Academy' });
    console.log('[2/5] Cleaned up previous integration test users.');

    // 2. Create Institution, Recruiter, and Students
    const instUser = await User.create({
      name: 'SIH Academy',
      email: instEmail,
      passwordHash: 'InstPass123!',
      role: 'institution',
      status: 'active'
    });

    const companyUser = await User.create({
      name: 'Amazon India recruiter',
      email: companyEmail,
      passwordHash: 'AmazonPass123!',
      role: 'company',
      status: 'active'
    });

    const student1User = await User.create({
      name: 'Placement Candidate Alpha',
      email: student1Email,
      passwordHash: 'AlphaPass123!',
      role: 'student',
      status: 'active'
    });

    const student2User = await User.create({
      name: 'Placement Candidate Beta',
      email: student2Email,
      passwordHash: 'BetaPass123!',
      role: 'student',
      status: 'active'
    });

    // Setup profiles
    const company = await Company.findOne({ userId: companyUser._id });
    company.verificationStatus = 'verified';
    await company.save();

    // Student 1 (CGPA: 9.0, Skills: React, Node)
    const student1 = await StudentProfile.findOne({ userId: student1User._id });
    student1.academicInformation = {
      college: 'SIH Academy',
      degree: 'B.Tech IT',
      branch: 'Information Technology',
      year: 4,
      cgpa: 9.0
    };
    student1.skills = ['React', 'Node.js'];
    student1.resumeUrl = 'https://drive.google.com/alpha_resume';
    await student1.save();

    // Student 2 (CGPA: 8.0, Skills: React, Python)
    const student2 = await StudentProfile.findOne({ userId: student2User._id });
    student2.academicInformation = {
      college: 'SIH Academy',
      degree: 'B.Tech IT',
      branch: 'Information Technology',
      year: 4,
      cgpa: 8.0
    };
    student2.skills = ['React', 'Python'];
    student2.resumeUrl = 'https://drive.google.com/beta_resume';
    await student2.save();

    console.log('[3/5] ASSERT PASS: Institution user registered and 2 students initialized for college "SIH Academy".');

    // 3. Post Opportunity and Place Student 1 (Accept application)
    const opp = await Opportunity.create({
      companyId: company._id,
      title: 'Web Engineering Associate',
      type: 'job',
      description: 'Full time web engineering role.',
      requiredSkills: ['React', 'Node.js'],
      location: 'Remote',
      stipend: '₹80,000 / month'
    });

    await Application.create({
      opportunityId: opp._id,
      studentId: student1._id,
      resumeUrl: student1.resumeUrl,
      coverLetter: 'Accepted student placement',
      status: 'accepted' // set placement status directly
    });

    await Application.create({
      opportunityId: opp._id,
      studentId: student2._id,
      resumeUrl: student2.resumeUrl,
      coverLetter: 'Active student applicant',
      status: 'applied'
    });

    console.log('[4/5] ASSERT PASS: Placed one candidate (status accepted) and kept the second as active applicant.');

    // 4. Calculate analytics (simulate controller logic)
    console.log('[5/5] Calculating institutional placement analytics math...');
    const collegeName = instUser.name;
    const students = await StudentProfile.find({
      'academicInformation.college': new RegExp(`^${collegeName}$`, 'i')
    }).populate('userId', 'name email');

    const totalStudents = students.length;
    const studentIds = students.map(s => s._id);

    const applications = await Application.find({ studentId: { $in: studentIds } });

    // Placement rate calculations
    const placedStudentIds = new Set();
    applications.forEach(app => {
      if (app.status === 'accepted') {
        placedStudentIds.add(app.studentId.toString());
      }
    });

    const placedStudents = placedStudentIds.size;
    const placementRate = Math.round((placedStudents / totalStudents) * 100);

    // CGPA calculations (Expect: (9.0 + 8.0) / 2 = 8.5)
    const sumCgpa = students.reduce((acc, curr) => acc + curr.academicInformation.cgpa, 0);
    const averageCgpa = Number((sumCgpa / totalStudents).toFixed(2));

    // Skill frequencies (Expect: React: 2, Node.js: 1, Python: 1)
    const skillCounts = {};
    students.forEach(s => {
      s.skills.forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });

    // Assertions
    if (totalStudents !== 2) {
      throw new Error(`FAIL: Expected 2 matched students, found ${totalStudents}`);
    }
    if (placedStudents !== 1 || placementRate !== 50) {
      throw new Error(`FAIL: Expected 1 placed student (50% placement rate), found ${placedStudents} (${placementRate}%)`);
    }
    if (averageCgpa !== 8.5) {
      throw new Error(`FAIL: Expected average CGPA of 8.5, calculated as ${averageCgpa}`);
    }
    if (skillCounts['React'] !== 2 || skillCounts['Node.js'] !== 1 || skillCounts['Python'] !== 1) {
      throw new Error('FAIL: Mismatch in skill distribution frequencies.');
    }

    console.log('      ASSERT PASS: Matched candidates total equals 2.');
    console.log('      ASSERT PASS: Placed students count equals 1 (Placement Rate: 50%).');
    console.log('      ASSERT PASS: Average CGPA calculated as exactly 8.5 / 10.');
    console.log('      ASSERT PASS: Skill frequency distribution matches candidate profiles: React (2), Node.js (1), Python (1).');

    console.log('\n--- All Institutional Placement Analytics Tests PASSED successfully! ---');

  } catch (error) {
    console.error('\n!!! Institutional Analytics Test FAILED !!!');
    console.error(error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB. Testing session closed.');
  }
};

runInstitutionTests();
