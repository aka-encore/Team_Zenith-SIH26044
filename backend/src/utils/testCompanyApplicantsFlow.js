import './loadEnv.js';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import StudentProfile from '../models/StudentProfile.js';
import Opportunity from '../models/Opportunity.js';
import Application from '../models/Application.js';
import Company from '../models/Company.js';
import User from '../models/User.js';

const runCompanyApplicantsFlowTest = async () => {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('   COMPANY APPLICANTS END-TO-END RECRUITMENT FLOW TEST SUITE    ');
  console.log('════════════════════════════════════════════════════════════════\n');

  try {
    await connectDB();

    // 1. Setup Student User & Profile
    let studentUser = await User.findOne({ role: 'student' });
    if (!studentUser) {
      throw new Error('FAIL: No student user found in database.');
    }

    let studentProfile = await StudentProfile.findOne({ userId: studentUser._id });
    if (!studentProfile) {
      studentProfile = await StudentProfile.create({
        userId: studentUser._id,
        skillsList: [
          { name: 'React', category: 'Frontend', proficiency: 'Advanced' },
          { name: 'Node.js', category: 'Backend', proficiency: 'Intermediate' }
        ],
        skills: ['React', 'Node.js'],
        academicInformation: {
          college: 'Zenith Institute of Technology',
          department: 'Computer Science',
          cgpa: 9.1,
          year: '4th Year'
        },
        resumeUrl: 'https://storage.googleapis.com/resumes/alex_chen_verified.pdf'
      });
    }

    // 2. Setup Company User & Profile
    let companyUser = await User.findOne({ role: 'company' });
    if (!companyUser) {
      throw new Error('FAIL: No company user found in database.');
    }

    let company = await Company.findOne({ userId: companyUser._id });
    if (!company) {
      company = await Company.create({
        userId: companyUser._id,
        companyName: 'HyperScale Cloud Tech',
        industry: 'Cloud Computing',
        location: 'Bengaluru',
        verificationStatus: 'verified'
      });
    }

    // 3. Create or find an Opportunity belonging to this company
    let opp = await Opportunity.findOne({ companyId: company._id, status: 'open' });
    if (!opp) {
      opp = await Opportunity.create({
        companyId: company._id,
        title: '[E2E-TEST] Senior Full Stack Engineer',
        type: 'job',
        description: 'Full stack development role for high-throughput cloud services.',
        requiredSkills: ['React', 'Node.js', 'MongoDB'],
        location: 'Bengaluru',
        stipend: '₹18,00,000 / annum',
        status: 'open'
      });
    }

    console.log(`✓ [1/5] Setup Verified: Company "${company.companyName}" & Opportunity "${opp.title}"`);

    // 4. Student Applies (Flow Step 1: Student Apply)
    await Application.deleteMany({ studentId: studentProfile._id, opportunityId: opp._id });

    const application = await Application.create({
      opportunityId: opp._id,
      studentId: studentProfile._id,
      resumeUrl: studentProfile.resumeUrl || 'https://storage.googleapis.com/resumes/alex_chen_verified.pdf',
      coverLetter: 'I have led the development of multiple high scale React and Node.js microservices.',
      status: 'applied'
    });

    console.log(`✓ [2/5] Student Application Created: ID ${application._id} (Status: "${application.status}")`);
    if (application.status !== 'applied') {
      throw new Error('FAIL: Initial status should be "applied".');
    }

    // 5. Company Reads Applications (Flow Step 2: Company Applicants)
    const companyOpps = await Opportunity.find({ companyId: company._id });
    const oppIds = companyOpps.map(o => o._id);
    const companyApps = await Application.find({ opportunityId: { $in: oppIds } })
      .populate('opportunityId', 'title type location stipend duration status requiredSkills')
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email' }
      })
      .sort({ createdAt: -1 });

    const targetApp = companyApps.find(a => a._id.toString() === application._id.toString());
    if (!targetApp) {
      throw new Error('FAIL: Company cannot see the submitted application for its opportunity.');
    }

    const applicantName = targetApp.studentId?.userId?.name;
    const applicantCollege = targetApp.studentId?.academicInformation?.college;
    const applicantSkills = targetApp.studentId?.skillsList?.map(s => s.name) || targetApp.studentId?.skills;
    const applicantResume = targetApp.resumeUrl;
    const applicantDate = targetApp.createdAt;
    const applicantStatus = targetApp.status;

    console.log(`✓ [3/5] Company Retrieved Application:`);
    console.log(`      • Student Name: ${applicantName}`);
    console.log(`      • College: ${applicantCollege}`);
    console.log(`      • Skills: [${(applicantSkills || []).join(', ')}]`);
    console.log(`      • Opportunity: ${targetApp.opportunityId?.title}`);
    console.log(`      • Resume URL: ${applicantResume}`);
    console.log(`      • Applied Date: ${new Date(applicantDate).toLocaleDateString()}`);
    console.log(`      • Status: ${applicantStatus}`);

    // 6. Company Shortlists Candidate (Flow Step 3: Shortlist)
    targetApp.status = 'shortlisted';
    await targetApp.save();
    console.log(`✓ [4/5] Company Updated Application Status to "shortlisted"`);

    // 7. Student Sees Updated Status (Flow Step 4: Student Application Status)
    const studentApps = await Application.find({ studentId: studentProfile._id })
      .populate('opportunityId', 'title type location');

    const updatedAppForStudent = studentApps.find(a => a._id.toString() === application._id.toString());
    if (!updatedAppForStudent || updatedAppForStudent.status !== 'shortlisted') {
      throw new Error(`FAIL: Student view did not reflect updated status "shortlisted", got "${updatedAppForStudent?.status}".`);
    }

    console.log(`✓ [5/5] Student Verified Updated Application Status: "${updatedAppForStudent.status}"`);

    // Clean up E2E test application & opportunity
    await Application.deleteMany({ _id: application._id });
    await Opportunity.deleteMany({ title: { $regex: /^\[E2E-TEST\]/ } });

    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('   COMPANY APPLICANTS E2E RECRUITMENT FLOW COMPLETED (ALL PASS)! ');
    console.log('════════════════════════════════════════════════════════════════\n');

  } catch (err) {
    console.error('\n!!! Company Applicants Integration Test Failed !!!');
    console.error(err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

runCompanyApplicantsFlowTest();
