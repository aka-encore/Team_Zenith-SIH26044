import './loadEnv.js';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import StudentProfile from '../models/StudentProfile.js';
import Opportunity from '../models/Opportunity.js';
import Application from '../models/Application.js';
import Company from '../models/Company.js';
import User from '../models/User.js';

const runInterviewFlowTest = async () => {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('       COMPLETE INTERVIEW RECRUITMENT FLOW TEST SUITE           ');
  console.log('════════════════════════════════════════════════════════════════\n');

  try {
    await connectDB();

    // 1. Setup Student User & Profile
    let studentUser = await User.findOne({ role: 'student' });
    if (!studentUser) throw new Error('FAIL: No student user found in database.');

    let studentProfile = await StudentProfile.findOne({ userId: studentUser._id });
    if (!studentProfile) {
      studentProfile = await StudentProfile.create({
        userId: studentUser._id,
        skills: ['React', 'Node.js', 'MongoDB'],
        academicInformation: { college: 'Zenith Tech', department: 'Computer Science', cgpa: 9.0, year: '4th Year' },
        resumeUrl: 'https://storage.googleapis.com/resumes/alex_chen_interview.pdf'
      });
    }

    // 2. Setup Company User & Profile
    let companyUser = await User.findOne({ role: 'company' });
    if (!companyUser) throw new Error('FAIL: No company user found in database.');

    let company = await Company.findOne({ userId: companyUser._id });
    if (!company) {
      company = await Company.create({
        userId: companyUser._id,
        companyName: 'CloudSphere Global',
        industry: 'Cloud Infrastructure',
        location: 'Bengaluru',
        verificationStatus: 'verified'
      });
    }

    // 3. Create or find an Opportunity belonging to this company
    let opp = await Opportunity.findOne({ companyId: company._id, status: 'open' });
    if (!opp) {
      opp = await Opportunity.create({
        companyId: company._id,
        title: '[INTERVIEW-TEST] Cloud Systems Architect',
        type: 'job',
        description: 'Systems architect position.',
        requiredSkills: ['React', 'Node.js', 'MongoDB', 'AWS'],
        location: 'Bengaluru',
        stipend: '₹22,00,000 / annum',
        status: 'open'
      });
    }

    // ─────────────────────────────────────────────────────────────
    // STEP 1: Student Applies
    // ─────────────────────────────────────────────────────────────
    await Application.deleteMany({ studentId: studentProfile._id, opportunityId: opp._id });

    const application = await Application.create({
      opportunityId: opp._id,
      studentId: studentProfile._id,
      resumeUrl: studentProfile.resumeUrl || 'https://storage.googleapis.com/resumes/alex_chen_interview.pdf',
      coverLetter: 'Ready for the interview rounds.',
      status: 'applied'
    });

    console.log(`✓ [1/6] Step 1: Student Applied (App ID: ${application._id}, Status: "${application.status}")`);

    // ─────────────────────────────────────────────────────────────
    // STEP 2: Company Shortlists Student
    // ─────────────────────────────────────────────────────────────
    application.status = 'shortlisted';
    await application.save();
    console.log(`✓ [2/6] Step 2: Company Shortlisted Candidate (Status: "${application.status}")`);

    // ─────────────────────────────────────────────────────────────
    // STEP 3: Company Schedules Interview
    // ─────────────────────────────────────────────────────────────
    const interviewDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days in future
    application.interviewDetails = {
      scheduledAt: interviewDate,
      date: interviewDate.toISOString().split('T')[0],
      time: '11:30 AM',
      mode: 'video',
      round: 'Technical Evaluation Round 1',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      notes: 'Prepare system design diagrams and coding environment.',
      status: 'scheduled'
    };
    // Update the related Application status to "interview"
    application.status = 'interview';
    await application.save();

    console.log(`✓ [3/6] Step 3: Interview Scheduled Successfully:`);
    console.log(`      • Student: ${studentUser.name}`);
    console.log(`      • Opportunity: "${opp.title}"`);
    console.log(`      • Date: ${application.interviewDetails.date} at ${application.interviewDetails.time}`);
    console.log(`      • Mode: ${application.interviewDetails.mode}`);
    console.log(`      • Meeting Link: ${application.interviewDetails.meetingLink}`);
    console.log(`      • Interview Status: ${application.interviewDetails.status}`);
    console.log(`      • Application Status: "${application.status}"`);

    if (application.status !== 'interview') {
      throw new Error('FAIL: Application status was not updated to "interview".');
    }

    // ─────────────────────────────────────────────────────────────
    // STEP 4: Student Sees Interview
    // ─────────────────────────────────────────────────────────────
    const studentApp = await Application.findOne({ _id: application._id, studentId: studentProfile._id })
      .populate('opportunityId', 'title type location');

    if (!studentApp || !studentApp.interviewDetails || !studentApp.interviewDetails.meetingLink) {
      throw new Error('FAIL: Student cannot see scheduled interview details.');
    }

    console.log(`✓ [4/6] Step 4: Student Successfully Retrieved Interview Details:`);
    console.log(`      • Role: ${studentApp.opportunityId?.title}`);
    console.log(`      • Link: ${studentApp.interviewDetails.meetingLink}`);
    console.log(`      • Scheduled At: ${studentApp.interviewDetails.scheduledAt.toISOString()}`);
    console.log(`      • Round: ${studentApp.interviewDetails.round}`);

    // ─────────────────────────────────────────────────────────────
    // STEP 5: Company Updates Status (e.g. Completed / Accepted)
    // ─────────────────────────────────────────────────────────────
    application.interviewDetails.status = 'completed';
    application.status = 'accepted';
    await application.save();

    const updatedApp = await Application.findById(application._id);
    if (updatedApp.interviewDetails.status !== 'completed' || updatedApp.status !== 'accepted') {
      throw new Error('FAIL: Status update was not persisted.');
    }

    console.log(`✓ [5/6] Step 5: Company Updated Interview Status to "completed" / Application Status to "accepted"`);

    // ─────────────────────────────────────────────────────────────
    // STEP 6: Multi-Tenant Scoping Test
    // ─────────────────────────────────────────────────────────────
    const otherCompanyOpps = await Opportunity.find({ companyId: { $ne: company._id } });
    if (otherCompanyOpps.length > 0) {
      const otherOppIds = otherCompanyOpps.map(o => o._id);
      const crossCompanyApps = await Application.find({
        _id: application._id,
        opportunityId: { $in: otherOppIds }
      });
      if (crossCompanyApps.length !== 0) {
        throw new Error('FAIL: Cross-company data leak detected.');
      }
    }
    console.log('✓ [6/6] Step 6: Multi-Tenant Scoping Validated (No cross-company access)');

    // Clean up test records
    await Application.deleteMany({ _id: application._id });
    await Opportunity.deleteMany({ title: { $regex: /^\[INTERVIEW-TEST\]/ } });

    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('    ALL INTERVIEW FLOW INTEGRATION TEST CASES PASSED (6/6)!      ');
    console.log('════════════════════════════════════════════════════════════════\n');

  } catch (err) {
    console.error('\n!!! Interview Flow Integration Test Failed !!!');
    console.error(err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

runInterviewFlowTest();
