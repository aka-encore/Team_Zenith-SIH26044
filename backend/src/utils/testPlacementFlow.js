import './loadEnv.js';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import StudentProfile from '../models/StudentProfile.js';
import Opportunity from '../models/Opportunity.js';
import Application from '../models/Application.js';
import Company from '../models/Company.js';
import User from '../models/User.js';
import { matchSkills } from './matchingEngine.js';

const runPlacementFlowTest = async () => {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('       COMPLETE PLACEMENT LIFECYCLE INTEGRATION TEST SUITE      ');
  console.log('════════════════════════════════════════════════════════════════\n');

  try {
    await connectDB();

    // 1. Setup Student User & Profile
    let studentUser = await User.findOne({ role: 'student' });
    if (!studentUser) throw new Error('FAIL: No student user found in MongoDB.');

    let studentProfile = await StudentProfile.findOne({ userId: studentUser._id });
    if (!studentProfile) {
      studentProfile = await StudentProfile.create({
        userId: studentUser._id,
        skills: ['React', 'Node.js', 'MongoDB', 'Docker', 'AWS'],
        academicInformation: {
          college: 'Zenith Institute of Technology',
          department: 'Computer Science & Engineering',
          branch: 'Computer Science',
          cgpa: 8.8,
          year: '4th Year'
        },
        resumeUrl: 'https://storage.googleapis.com/resumes/alex_chen_placement.pdf'
      });
    }

    // 2. Setup Company & Partner
    let companyUser = await User.findOne({ role: 'company' });
    let company = await Company.findOne({ userId: companyUser._id });
    if (!company) {
      company = await Company.create({
        userId: companyUser._id,
        companyName: 'CloudWave Global Networks',
        industry: 'Enterprise Software & Cloud',
        location: 'Bengaluru',
        verificationStatus: 'verified'
      });
    }

    // ─────────────────────────────────────────────────────────────
    // STEP 1: Faculty / Admin creates Placement Drive
    // ─────────────────────────────────────────────────────────────
    await Opportunity.deleteMany({ title: { $regex: /^\[PLACEMENT-DRIVE\]/ } });

    const driveDeadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days in future
    const placementDrive = await Opportunity.create({
      companyId: company._id,
      title: '[PLACEMENT-DRIVE] Graduate Cloud Engineer 2026',
      type: 'job',
      isPlacementDrive: true,
      driveName: 'Annual Campus Recruitment Drive 2026',
      description: 'Campus hiring for high performing graduating engineers.',
      requiredSkills: ['React', 'Node.js', 'MongoDB', 'AWS'],
      location: 'Bengaluru / Hyderabad',
      stipend: '₹14,50,000 / annum (CTC)',
      deadline: driveDeadline,
      minCgpa: 7.5,
      eligibleBranches: ['Computer Science', 'Information Technology', 'Electronics'],
      eligibleYears: ['4th Year', '2026'],
      status: 'open'
    });

    console.log(`✓ [1/7] Step 1: Placement Drive Created by Faculty/Admin:`);
    console.log(`      • Title: "${placementDrive.title}"`);
    console.log(`      • Min CGPA: ${placementDrive.minCgpa}`);
    console.log(`      • Eligible Branches: [${placementDrive.eligibleBranches.join(', ')}]`);
    console.log(`      • Eligible Years: [${placementDrive.eligibleYears.join(', ')}]`);
    console.log(`      • Required Skills: [${placementDrive.requiredSkills.join(', ')}]`);

    // ─────────────────────────────────────────────────────────────
    // STEP 2: Student Sees Eligible Drive & Checks Real Eligibility
    // ─────────────────────────────────────────────────────────────
    const studentBranch = (studentProfile.academicInformation?.branch || studentProfile.academicInformation?.department || '').toLowerCase();
    const studentYear = (studentProfile.academicInformation?.year || '').toLowerCase();
    const studentCgpa = Number(studentProfile.academicInformation?.cgpa || 0);

    const isBranchEligible = placementDrive.eligibleBranches.some(b => studentBranch.includes(b.toLowerCase()) || b.toLowerCase().includes(studentBranch));
    const isYearEligible = placementDrive.eligibleYears.some(y => studentYear.includes(y.toLowerCase()) || y.toLowerCase().includes(studentYear));
    const isCgpaEligible = studentCgpa >= placementDrive.minCgpa;
    const match = matchSkills(studentProfile, placementDrive);
    const isSkillsEligible = match.matchedSkills.length > 0;

    const isEligible = isBranchEligible && isYearEligible && isCgpaEligible && isSkillsEligible;

    console.log(`\n✓ [2/7] Step 2: Real Eligibility Verification for Student ${studentUser.name}:`);
    console.log(`      • Branch Match: ${isBranchEligible ? 'YES' : 'NO'} (Student: "${studentProfile.academicInformation.branch}")`);
    console.log(`      • Year Match: ${isYearEligible ? 'YES' : 'NO'} (Student: "${studentProfile.academicInformation.year}")`);
    console.log(`      • CGPA Match: ${isCgpaEligible ? 'YES' : 'NO'} (Student: ${studentCgpa} vs Min: ${placementDrive.minCgpa})`);
    console.log(`      • Skills Match: ${match.matchPercentage}% [Matched: ${match.matchedSkills.join(', ')}]`);
    console.log(`      • Overall Eligible: ${isEligible ? 'ELIGIBLE ✓' : 'NOT ELIGIBLE ✗'}`);

    if (!isEligible) {
      throw new Error('FAIL: Student should be eligible based on profile parameters.');
    }

    // ─────────────────────────────────────────────────────────────
    // STEP 3: Student Applies to Drive
    // ─────────────────────────────────────────────────────────────
    await Application.deleteMany({ studentId: studentProfile._id, opportunityId: placementDrive._id });

    const application = await Application.create({
      opportunityId: placementDrive._id,
      studentId: studentProfile._id,
      resumeUrl: studentProfile.resumeUrl || 'https://storage.googleapis.com/resumes/alex_chen_placement.pdf',
      coverLetter: 'Applying for the Annual Campus Recruitment Drive.',
      status: 'applied'
    });

    console.log(`\n✓ [3/7] Step 3: Student Applied to Placement Drive (Status: "${application.status}")`);

    // ─────────────────────────────────────────────────────────────
    // STEP 4: Company Shortlists Candidate
    // ─────────────────────────────────────────────────────────────
    application.status = 'shortlisted';
    await application.save();
    console.log(`✓ [4/7] Step 4: Company Shortlisted Candidate (Status: "${application.status}")`);

    // ─────────────────────────────────────────────────────────────
    // STEP 5: Interview Conducted
    // ─────────────────────────────────────────────────────────────
    application.interviewDetails = {
      scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      date: 'Tomorrow',
      time: '10:00 AM',
      mode: 'video',
      round: 'Final Campus Technical & Fitment Round',
      meetingLink: 'https://meet.google.com/placement-round',
      notes: 'Final round with Technical Director.',
      status: 'completed'
    };
    application.status = 'interview';
    await application.save();
    console.log(`✓ [5/7] Step 5: Interview Scheduled and Conducted (Status: "${application.status}")`);

    // ─────────────────────────────────────────────────────────────
    // STEP 6: Student Selected & Placement Information Saved
    // ─────────────────────────────────────────────────────────────
    application.status = 'selected';
    application.placementDetails = {
      isPlaced: true,
      placedAt: new Date(),
      package: '₹14,50,000 / annum (CTC)',
      designation: 'Graduate Cloud Engineer',
      location: 'Bengaluru',
      joiningDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
    };
    await application.save();

    console.log(`✓ [6/7] Step 6: Student Selected & Placement Saved:`);
    console.log(`      • Application Status: "${application.status}"`);
    console.log(`      • Package: ${application.placementDetails.package}`);
    console.log(`      • Role: ${application.placementDetails.designation}`);
    console.log(`      • Company: ${company.companyName}`);

    // ─────────────────────────────────────────────────────────────
    // STEP 7: Faculty / Admin Placement Record Verification
    // ─────────────────────────────────────────────────────────────
    const placedApps = await Application.find({ status: { $in: ['accepted', 'selected'] } })
      .populate('opportunityId', 'title type stipend location')
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email' }
      });

    const targetPlaced = placedApps.find(a => a._id.toString() === application._id.toString());
    if (!targetPlaced) {
      throw new Error('FAIL: Placed student not found in Faculty/Admin placement query.');
    }

    console.log(`\n✓ [7/7] Step 7: Faculty/Admin Verified Placed Student:`);
    console.log(`      • Student Name: ${targetPlaced.studentId?.userId?.name}`);
    console.log(`      • Placed Role: ${targetPlaced.opportunityId?.title}`);
    console.log(`      • Offer Package: ${targetPlaced.placementDetails?.package || targetPlaced.opportunityId?.stipend}`);
    console.log(`      • Status in Portal: "${targetPlaced.status}"`);

    // Clean up test records
    await Application.deleteMany({ _id: application._id });
    await Opportunity.deleteMany({ title: { $regex: /^\[PLACEMENT-DRIVE\]/ } });

    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('   ALL 7 PLACEMENT LIFECYCLE FLOW TEST CASES PASSED (100%)!     ');
    console.log('════════════════════════════════════════════════════════════════\n');

  } catch (err) {
    console.error('\n!!! Placement Flow Integration Test Failed !!!');
    console.error(err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

runPlacementFlowTest();
