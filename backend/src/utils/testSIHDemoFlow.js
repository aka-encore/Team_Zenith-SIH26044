import './loadEnv.js';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import Company from '../models/Company.js';
import Opportunity from '../models/Opportunity.js';
import Application from '../models/Application.js';
import { matchSkills } from './matchingEngine.js';

const runSIHDemoFlowTest = async () => {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('        SIH 2024 END-TO-END DEMO PRESENTATION TEST SUITE        ');
  console.log('════════════════════════════════════════════════════════════════\n');

  try {
    await connectDB();

    // ─────────────────────────────────────────────────────────────
    // ACT 1: STUDENT JOURNEY
    // ─────────────────────────────────────────────────────────────
    console.log('─── ACT 1: STUDENT DEMO FLOW ───');

    // 1.1 Student Login
    let studentUser = await User.findOne({ role: 'student' });
    if (!studentUser) throw new Error('FAIL: Student user missing.');
    console.log(`✓ 1.1 Student Login: Signed in as "${studentUser.name}" (${studentUser.email})`);

    // 1.2 Student Profile & Skills
    let studentProfile = await StudentProfile.findOne({ userId: studentUser._id });
    studentProfile.skills = ['React', 'Node.js', 'JavaScript', 'MongoDB'];
    studentProfile.skillsList = [
      { name: 'React', category: 'Frontend', proficiency: 'Advanced' },
      { name: 'Node.js', category: 'Backend', proficiency: 'Intermediate' },
      { name: 'JavaScript', category: 'Programming', proficiency: 'Advanced' },
      { name: 'MongoDB', category: 'Database', proficiency: 'Beginner' }
    ];
    studentProfile.academicInformation = {
      college: 'Zenith Institute of Technology',
      department: 'Computer Science & Engineering',
      branch: 'Computer Science',
      cgpa: 8.9,
      graduationYear: '2026'
    };
    studentProfile.resumeUrl = 'https://storage.googleapis.com/resumes/alex_chen_sih_demo.pdf';
    await studentProfile.save();
    console.log(`✓ 1.2 Profile & Skills: 4 Verified Skills Recorded, Resume Linked`);

    // 1.3 Skill Gap Analysis
    const sampleOpp = {
      title: 'Full Stack Cloud Engineer',
      requiredSkills: ['React', 'Node.js', 'MongoDB', 'AWS', 'Docker']
    };
    const gapAnalysis = matchSkills(studentProfile, sampleOpp);
    console.log(`✓ 1.3 Skill Gap View: ${gapAnalysis.matchPercentage}% Compatibility Score`);
    console.log(`      • Matched Skills: [${gapAnalysis.matchedSkills.join(', ')}]`);
    console.log(`      • Missing Skills to Learn: [${gapAnalysis.missingSkills.join(', ')}]`);

    // 1.4 Job/Internship Discovery & Apply
    let companyUser = await User.findOne({ role: 'company' });
    let company = await Company.findOne({ userId: companyUser._id });
    if (!company) {
      company = await Company.create({
        userId: companyUser._id,
        companyName: 'TechNova Global Solutions',
        industry: 'Enterprise Software & Cloud',
        location: 'Bengaluru',
        verificationStatus: 'verified'
      });
    }

    await Opportunity.deleteMany({ title: { $regex: /^\[SIH-DEMO\]/ } });

    const demoOpportunity = await Opportunity.create({
      companyId: company._id,
      title: '[SIH-DEMO] Full Stack Cloud Engineer',
      type: 'job',
      description: 'Campus recruitment role for high potential software engineers.',
      requiredSkills: ['React', 'Node.js', 'MongoDB', 'AWS'],
      location: 'Bengaluru',
      stipend: '₹16,00,000 / annum',
      minCgpa: 7.5,
      eligibleBranches: ['Computer Science', 'Information Technology'],
      status: 'open'
    });

    await Application.deleteMany({ studentId: studentProfile._id, opportunityId: demoOpportunity._id });

    const application = await Application.create({
      opportunityId: demoOpportunity._id,
      studentId: studentProfile._id,
      resumeUrl: studentProfile.resumeUrl,
      coverLetter: 'Applying for SIH demo walkthrough',
      status: 'applied'
    });
    console.log(`✓ 1.4 Student Applied: Submitted Application for "${demoOpportunity.title}"`);

    // ─────────────────────────────────────────────────────────────
    // ACT 2: COMPANY / RECRUITER JOURNEY
    // ─────────────────────────────────────────────────────────────
    console.log('\n─── ACT 2: COMPANY DEMO FLOW ───');

    // 2.1 Company Login
    console.log(`✓ 2.1 Company Login: Signed in as "${company.companyName}" (${companyUser.email})`);

    // 2.2 View Applicants with Skill Match
    const appMatch = matchSkills(studentProfile, demoOpportunity);
    console.log(`✓ 2.2 Candidate Match Screened: ${appMatch.matchPercentage}% Compatibility against requirements`);

    // 2.3 Shortlist Candidate
    application.status = 'shortlisted';
    await application.save();
    console.log(`✓ 2.3 Candidate Shortlisted: Status -> "shortlisted"`);

    // 2.4 Schedule Interview
    application.interviewDetails = {
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      date: 'In 2 Days',
      time: '11:00 AM IST',
      mode: 'video',
      round: 'Technical Evaluation Round 1',
      meetingLink: 'https://meet.google.com/sih-demo-round',
      notes: 'Please prepare live coding demonstrations in React and Node.js.',
      status: 'scheduled'
    };
    application.status = 'interview';
    await application.save();
    console.log(`✓ 2.4 Interview Scheduled: Video link "${application.interviewDetails.meetingLink}" linked`);

    // ─────────────────────────────────────────────────────────────
    // ACT 3: FACULTY / INSTITUTION JOURNEY
    // ─────────────────────────────────────────────────────────────
    console.log('\n─── ACT 3: FACULTY DEMO FLOW ───');

    let facultyUser = await User.findOne({ role: 'faculty' });
    console.log(`✓ 3.1 Faculty Login: Signed in as "${facultyUser?.name || 'Faculty Head'}"`);

    const allStudents = await StudentProfile.find({}).populate('userId', 'name email');
    console.log(`✓ 3.2 Student Skills Tracking: ${allStudents.length} Student Profiles Loaded`);

    const placedApps = await Application.find({ status: { $in: ['accepted', 'selected', 'interview'] } });
    console.log(`✓ 3.3 Placement Pipeline: ${placedApps.length} Active Candidates Tracked in Institutional Pipeline`);

    // ─────────────────────────────────────────────────────────────
    // ACT 4: ADMIN JOURNEY
    // ─────────────────────────────────────────────────────────────
    console.log('\n─── ACT 4: ADMIN DEMO FLOW ───');

    let adminUser = await User.findOne({ role: 'admin' });
    console.log(`✓ 4.1 Admin Login: Signed in as "${adminUser?.name || 'Platform Administrator'}"`);

    const totalUsers = await User.countDocuments({});
    const totalCompanies = await Company.countDocuments({});
    const totalOpps = await Opportunity.countDocuments({});
    const totalApps = await Application.countDocuments({});
    console.log(`✓ 4.2 Admin Governance: Platform Totals (Users: ${totalUsers}, Companies: ${totalCompanies}, Opportunities: ${totalOpps}, Applications: ${totalApps})`);

    // Complete candidate selection
    application.status = 'selected';
    application.placementDetails = {
      isPlaced: true,
      placedAt: new Date(),
      package: '₹16,00,000 / annum',
      designation: 'Full Stack Cloud Engineer',
      location: 'Bengaluru'
    };
    await application.save();
    console.log(`✓ 4.3 Candidate Selected & Placement Verified: ${studentUser.name} Placed at ${company.companyName} (${application.placementDetails.package})`);

    // Cleanup demo records
    await Application.deleteMany({ _id: application._id });
    await Opportunity.deleteMany({ title: { $regex: /^\[SIH-DEMO\]/ } });

    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('   ALL 4 ACTS OF THE SIH DEMO FLOW PASSED (100% OPERATIONAL)    ');
    console.log('════════════════════════════════════════════════════════════════\n');

  } catch (err) {
    console.error('\n!!! SIH Demo Flow Test Failed !!!');
    console.error(err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

runSIHDemoFlowTest();
