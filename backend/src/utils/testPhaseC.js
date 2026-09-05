import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Company from '../models/Company.js';
import StudentProfile from '../models/StudentProfile.js';
import Opportunity from '../models/Opportunity.js';
import Application from '../models/Application.js';
import { loadEnv } from './loadEnv.js';

loadEnv(import.meta.url);

const runPhaseCTests = async () => {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('  SIH26044 PHASE C END-TO-END VERIFICATION SUITE');
  console.log('════════════════════════════════════════════════════════════════\n');

  try {
    const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sih26044';
    await mongoose.connect(dbUri);
    console.log('[1/6] Connected to MongoDB database successfully.');

    // 1. Setup Company User & Verified Profile
    const companyEmail = 'phase_c_recruiter@corporate.com';
    await User.deleteMany({ email: { $in: [companyEmail, 'neha.gupta@companytest.com', 'rohan.mehta@companytest.com'] } });
    const companyUser = await User.create({
      name: 'CloudScale Global Inc.',
      email: companyEmail,
      passwordHash: 'RecruiterSecure123!',
      role: 'company',
      status: 'active'
    });

    let company = await Company.findOne({ userId: companyUser._id });
    if (!company) {
      company = await Company.create({
        userId: companyUser._id,
        companyName: 'CloudScale Global Inc.',
        industry: 'Cloud Infrastructure',
        location: 'Hyderabad, India',
        verificationStatus: 'verified'
      });
    } else {
      company.verificationStatus = 'verified';
      await company.save();
    }
    console.log('[2/6] Verified Company Profile set up:', company.companyName);

    // 2. Setup Active Opportunity with Structured Skills
    const opportunity = await Opportunity.create({
      companyId: company._id,
      title: 'Cloud DevOps & Backend Specialist',
      type: 'job',
      description: 'Design and deploy scalable cloud microservices, Kubernetes clusters, and Node.js APIs.',
      requiredSkills: [
        { name: 'Node.js', importance: 'required', proficiency: 'intermediate', weight: 35 },
        { name: 'MongoDB', importance: 'required', proficiency: 'intermediate', weight: 35 },
        { name: 'Docker', importance: 'preferred', proficiency: 'beginner', weight: 30 }
      ],
      location: 'Hybrid - Hyderabad',
      stipend: '₹14,00,000 / year',
      minCgpa: 7.0,
      eligibleBranches: ['Computer Science', 'Information Technology'],
      status: 'open'
    });
    console.log('[3/6] Created Opportunity:', opportunity.title, 'with 3 structured skills.');

    // 3. Setup Test Students
    const studentUser1 = await User.create({
      name: 'Neha Gupta',
      email: 'neha.gupta@companytest.com',
      passwordHash: 'StudentPass123!',
      role: 'student',
      status: 'active'
    });
    let student1 = await StudentProfile.findOne({ userId: studentUser1._id });
    if (!student1) {
      student1 = new StudentProfile({ userId: studentUser1._id });
    }
    student1.academicInformation = {
      college: 'Zenith Tech Campus',
      branch: 'Computer Science',
      degree: 'B.Tech',
      year: '4th Year',
      cgpa: 8.9
    };
    student1.skillsList = [
      { name: 'Node.js', proficiency: 'Advanced' },
      { name: 'MongoDB', proficiency: 'Intermediate' },
      { name: 'Docker', proficiency: 'Beginner' }
    ];
    student1.skills = ['Node.js', 'MongoDB', 'Docker'];
    student1.careerInterests = ['Cloud Computing', 'DevOps', 'Backend Architecture'];
    await student1.save();

    const studentUser2 = await User.create({
      name: 'Rohan Mehta',
      email: 'rohan.mehta@companytest.com',
      passwordHash: 'StudentPass123!',
      role: 'student',
      status: 'active'
    });
    let student2 = await StudentProfile.findOne({ userId: studentUser2._id });
    if (!student2) {
      student2 = new StudentProfile({ userId: studentUser2._id });
    }
    student2.academicInformation = {
      college: 'Zenith Tech Campus',
      branch: 'Civil Engineering',
      degree: 'B.Tech',
      year: '1st Year',
      cgpa: 6.2
    };
    student2.skillsList = [
      { name: 'AutoCAD', proficiency: 'Beginner' }
    ];
    student2.skills = ['AutoCAD'];
    student2.careerInterests = ['Structural Design'];
    await student2.save();
    console.log('[4/6] Created Test Candidates: Neha Gupta (Strong Match) & Rohan Mehta (Low Match).');

    // 4. Test Recommended Candidates Endpoint
    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_sih26044_2024';
    const testToken = jwt.sign(
      { id: companyUser._id, role: 'company', email: companyUser.email },
      secret,
      { expiresIn: '1h' }
    );

    const recRes = await fetch(`http://localhost:5000/api/company/recommended-candidates?opportunityId=${opportunity._id}`, {
      headers: { 'Authorization': `Bearer ${testToken}` }
    });
    const recJson = await recRes.json();

    console.log('\n[5/6] Testing GET /api/company/recommended-candidates:');
    console.log(' - HTTP Status:', recRes.status);
    console.log(' - Success:', recJson.success);
    console.log(' - Total Candidates Returned:', recJson.candidates?.length);
    console.log(' - Active Opportunity:', recJson.activeOpportunity?.title);
    console.log(' - Active Opportunity Required Skills Count:', recJson.activeOpportunity?.requiredSkills?.length);

    if (!recJson.success || !recJson.candidates || recJson.candidates.length === 0) {
      throw new Error('Recommended candidates endpoint failed or returned empty list.');
    }

    const topCandidate = recJson.candidates[0];
    console.log(` - Top Ranked Candidate: ${topCandidate.name} (${topCandidate.compatibilityScore}%)`);
    console.log(` - Matched Skills:`, topCandidate.matchedSkills);
    console.log(` - Missing Skills:`, topCandidate.missingSkills);
    console.log(` - Is Eligible:`, topCandidate.isEligible);

    if (topCandidate.name !== 'Neha Gupta') {
      throw new Error(`Expected Neha Gupta to be top ranked candidate, got ${topCandidate.name}`);
    }
    if (topCandidate.compatibilityScore < 85) {
      throw new Error(`Expected Neha Gupta compatibility score >= 85%, got ${topCandidate.compatibilityScore}%`);
    }

    // 5. Test Shortlist Endpoint
    console.log('\n[6/6] Testing POST /api/company/students/:studentId/shortlist:');
    const shortlistRes = await fetch(`http://localhost:5000/api/company/students/${student1._id}/shortlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`
      },
      body: JSON.stringify({
        opportunityId: opportunity._id,
        notes: 'Shortlisted by rec engine'
      })
    });
    const shortlistJson = await shortlistRes.json();
    console.log(' - Shortlist Status:', shortlistRes.status);
    console.log(' - Shortlist Success:', shortlistJson.success);
    console.log(' - Application Status:', shortlistJson.application?.status);
    console.log(' - Stored Compatibility Score:', shortlistJson.application?.compatibilityScore);

    if (!shortlistJson.success || shortlistJson.application?.status !== 'shortlisted') {
      throw new Error('Shortlist action failed: ' + JSON.stringify(shortlistJson));
    }

    // Verify application stored in MongoDB
    const appDoc = await Application.findOne({ studentId: student1._id, opportunityId: opportunity._id });
    if (!appDoc || appDoc.status !== 'shortlisted') {
      throw new Error('Application document was not properly created/updated in MongoDB');
    }
    console.log(' - Verified Application Document in MongoDB ID:', appDoc._id);

    // 6. Test Reject Endpoint
    console.log('\nTesting POST /api/company/students/:studentId/reject:');
    const rejectRes = await fetch(`http://localhost:5000/api/company/students/${student2._id}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`
      },
      body: JSON.stringify({
        opportunityId: opportunity._id,
        reason: 'Missing core skills'
      })
    });
    const rejectJson = await rejectRes.json();
    console.log(' - Reject Status:', rejectRes.status);
    console.log(' - Reject Success:', rejectJson.success);

    const rejectAppDoc = await Application.findOne({ studentId: student2._id, opportunityId: opportunity._id });
    if (!rejectAppDoc || rejectAppDoc.status !== 'rejected') {
      throw new Error('Rejected application document was not updated in MongoDB');
    }
    console.log(' - Verified Rejected Application in MongoDB ID:', rejectAppDoc._id);

    // 7. Verify exclusion of rejected candidate by default
    const recFilteredRes = await fetch(`http://localhost:5000/api/company/recommended-candidates?opportunityId=${opportunity._id}`, {
      headers: { 'Authorization': `Bearer ${testToken}` }
    });
    const recFilteredJson = await recFilteredRes.json();
    const hasRejected = recFilteredJson.candidates.some(c => c._id.toString() === student2._id.toString());
    console.log(' - Candidate 2 properly excluded by default:', !hasRejected);
    if (hasRejected) {
      throw new Error('Rejected candidate was not excluded from default recommendations!');
    }

    // Cleanup test data
    await Application.deleteMany({ opportunityId: opportunity._id });
    await Opportunity.findByIdAndDelete(opportunity._id);
    await StudentProfile.deleteMany({ _id: { $in: [student1._id, student2._id] } });
    await User.deleteMany({ _id: { $in: [companyUser._id, studentUser1._id, studentUser2._id] } });
    await Company.findByIdAndDelete(company._id);
    console.log('\nCleaned up Phase C test records from MongoDB.');

    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('  ALL PHASE C END-TO-END TESTS PASSED WITH 100% SUCCESS!');
    console.log('════════════════════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ PHASE C TEST SUITE FAILED:', err.message);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
};

runPhaseCTests();
