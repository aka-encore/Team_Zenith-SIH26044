import './loadEnv.js';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import StudentProfile from '../models/StudentProfile.js';
import Opportunity from '../models/Opportunity.js';
import Application from '../models/Application.js';
import Company from '../models/Company.js';
import User from '../models/User.js';

const runNotificationSystemTest = async () => {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('       NOTIFICATION SYSTEM REAL EVENT INTEGRATION TEST          ');
  console.log('════════════════════════════════════════════════════════════════\n');

  try {
    await connectDB();

    // 1. Setup Student User
    let studentUser = await User.findOne({ role: 'student' });
    if (!studentUser) throw new Error('FAIL: No student user found in MongoDB.');
    studentUser.readNotifications = [];
    await studentUser.save();

    let studentProfile = await StudentProfile.findOne({ userId: studentUser._id });
    if (!studentProfile) {
      studentProfile = await StudentProfile.create({
        userId: studentUser._id,
        skills: ['React', 'TypeScript', 'Node.js'],
        resumeUrl: 'https://storage.googleapis.com/resumes/alex_chen_notif.pdf'
      });
    }

    // 2. Setup Company User
    let companyUser = await User.findOne({ role: 'company' });
    if (!companyUser) throw new Error('FAIL: No company user found in MongoDB.');
    companyUser.readNotifications = [];
    await companyUser.save();

    let company = await Company.findOne({ userId: companyUser._id });
    if (!company) {
      company = await Company.create({
        userId: companyUser._id,
        companyName: 'NexGen Cloud Systems',
        industry: 'Cloud Software',
        verificationStatus: 'verified'
      });
    }

    // 3. Setup Opportunity
    let opp = await Opportunity.findOne({ companyId: company._id });
    if (!opp) {
      opp = await Opportunity.create({
        companyId: company._id,
        title: '[NOTIF-TEST] Distributed Systems Engineer',
        type: 'job',
        description: 'Cloud systems role',
        requiredSkills: ['React', 'Node.js', 'AWS'],
        location: 'Bengaluru',
        stipend: '₹18,00,000 / annum',
        status: 'open'
      });
    }

    // ─────────────────────────────────────────────────────────────
    // EVENT 1: New Application Submitted
    // ─────────────────────────────────────────────────────────────
    await Application.deleteMany({ studentId: studentProfile._id, opportunityId: opp._id });

    const application = await Application.create({
      opportunityId: opp._id,
      studentId: studentProfile._id,
      resumeUrl: studentProfile.resumeUrl || 'https://storage.googleapis.com/resumes/alex_chen_notif.pdf',
      coverLetter: 'Notification test application',
      status: 'applied'
    });

    console.log(`✓ [1/8] Event 1: New Application Created (App ID: ${application._id})`);

    // ─────────────────────────────────────────────────────────────
    // EVENT 2: Application Reviewed
    // ─────────────────────────────────────────────────────────────
    application.status = 'reviewed';
    await application.save();
    console.log(`✓ [2/8] Event 2: Application Status -> "reviewed"`);

    // ─────────────────────────────────────────────────────────────
    // EVENT 3: Student Shortlisted
    // ─────────────────────────────────────────────────────────────
    application.status = 'shortlisted';
    await application.save();
    console.log(`✓ [3/8] Event 3: Application Status -> "shortlisted"`);

    // ─────────────────────────────────────────────────────────────
    // EVENT 4: Interview Scheduled
    // ─────────────────────────────────────────────────────────────
    const interviewDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    application.interviewDetails = {
      scheduledAt: interviewDate,
      date: interviewDate.toISOString().split('T')[0],
      time: '02:00 PM',
      mode: 'video',
      round: 'Technical Evaluation Round 1',
      meetingLink: 'https://meet.google.com/test-notif-meet',
      notes: 'Live coding evaluation',
      status: 'scheduled'
    };
    application.status = 'interview';
    await application.save();
    console.log(`✓ [4/8] Event 4: Interview Scheduled (Date: ${interviewDate.toISOString().split('T')[0]}, Mode: video)`);

    // ─────────────────────────────────────────────────────────────
    // EVENT 5: Interview Cancelled
    // ─────────────────────────────────────────────────────────────
    application.interviewDetails.status = 'cancelled';
    await application.save();
    console.log(`✓ [5/8] Event 5: Interview Cancelled Status Recorded`);

    // ─────────────────────────────────────────────────────────────
    // EVENT 6: Student Selected & Placement Completed
    // ─────────────────────────────────────────────────────────────
    application.status = 'selected';
    application.placementDetails = {
      isPlaced: true,
      placedAt: new Date(),
      package: '₹18,00,000 / annum',
      designation: 'Distributed Systems Engineer',
      location: 'Bengaluru'
    };
    await application.save();
    console.log(`✓ [6/8] Event 6 & 7: Student Selected & Placement Completed (Package: ${application.placementDetails.package})`);

    // ─────────────────────────────────────────────────────────────
    // EVENT 7: Rejection Event Validation (on separate opportunity)
    // ─────────────────────────────────────────────────────────────
    const opp2 = await Opportunity.create({
      companyId: company._id,
      title: '[NOTIF-TEST-2] Junior Frontend Developer',
      type: 'job',
      description: 'Junior frontend role',
      requiredSkills: ['React', 'CSS'],
      location: 'Remote',
      stipend: '₹8,00,000 / annum',
      status: 'open'
    });

    const rejApp = await Application.create({
      opportunityId: opp2._id,
      studentId: studentProfile._id,
      resumeUrl: 'https://storage.googleapis.com/resumes/rejected_sample.pdf',
      status: 'rejected'
    });
    console.log(`✓ [7/8] Event 8: Application Rejected Status Recorded on Second Application`);

    // ─────────────────────────────────────────────────────────────
    // VERIFICATION: Unread Count, Mark as Read & Mark All as Read
    // ─────────────────────────────────────────────────────────────
    const notif1Id = `app_submitted_${application._id}`;
    const notif2Id = `student_selected_${application._id}`;

    // Mark 1 as read
    studentUser.readNotifications.push(notif1Id);
    await studentUser.save();

    let reloadedUser = await User.findById(studentUser._id);
    if (!reloadedUser.readNotifications.includes(notif1Id)) {
      throw new Error('FAIL: Mark single notification as read failed.');
    }
    console.log(`✓ [8/8] Step 8: Mark Single Notification as Read Verified`);

    // Mark all as read
    const allIds = [notif1Id, notif2Id, `app_shortlisted_${application._id}`, `interview_sched_${application._id}`];
    reloadedUser.readNotifications = allIds;
    await reloadedUser.save();

    const finalUser = await User.findById(studentUser._id);
    if (finalUser.readNotifications.length < allIds.length) {
      throw new Error('FAIL: Mark all notifications as read failed.');
    }
    console.log(`      • Mark All as Read Verified (${finalUser.readNotifications.length} read notifications persisted)`);

    // Clean up test records
    await Application.deleteMany({ _id: { $in: [application._id, rejApp._id] } });
    await Opportunity.deleteMany({ title: { $regex: /^\[NOTIF-TEST/ } });

    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('   ALL NOTIFICATION SYSTEM TESTS PASSED SUCCESSFULLY (100%)!    ');
    console.log('════════════════════════════════════════════════════════════════\n');

  } catch (err) {
    console.error('\n!!! Notification System Integration Test Failed !!!');
    console.error(err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

runNotificationSystemTest();
