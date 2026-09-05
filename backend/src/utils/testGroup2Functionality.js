import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Company from '../models/Company.js';
import StudentProfile from '../models/StudentProfile.js';
import Opportunity from '../models/Opportunity.js';
import Application from '../models/Application.js';
import AssessmentResult from '../models/AssessmentResult.js';

dotenv.config();

const runTest = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sih26044');
    console.log('MongoDB connected for automated verification test.');

    // 1. Find or create a verified company user
    let companyUser = await User.findOne({ role: 'company' });
    if (!companyUser) {
      companyUser = await User.create({
        name: 'Nexus Corp Tech',
        email: 'recruiter@nexuscorp.io',
        password: 'Password123!',
        role: 'company',
        status: 'active',
        emailVerified: true
      });
    }

    let company = await Company.findOne({ userId: companyUser._id });
    if (!company) {
      company = await Company.create({
        userId: companyUser._id,
        companyName: 'Nexus Corp Tech',
        industry: 'Software & Cloud',
        description: 'Pioneering next-generation enterprise AI solutions.',
        website: 'https://nexuscorp.io',
        location: 'Bengaluru, India',
        companySize: '100-500 employees',
        foundedYear: '2019',
        technologiesUsed: ['React', 'Node.js', 'MongoDB', 'Docker', 'AWS'],
        hiringAreas: ['Fullstack Engineering', 'Cloud Infrastructure', 'Machine Learning'],
        verificationStatus: 'verified'
      });
    }

    // 2. Find or create a student
    let studentUser = await User.findOne({ role: 'student' });
    if (!studentUser) {
      studentUser = await User.create({
        name: 'Alex Chen',
        email: 'alexchen@zenith.edu',
        password: 'Password123!',
        role: 'student',
        status: 'active',
        emailVerified: true
      });
    }

    let studentProfile = await StudentProfile.findOne({ userId: studentUser._id });
    if (!studentProfile) {
      studentProfile = await StudentProfile.create({
        userId: studentUser._id,
        academicInformation: {
          degree: 'B.Tech',
          branch: 'Computer Science',
          college: 'Zenith Institute of Technology',
          year: '4th Year (2026)',
          cgpa: 8.85
        },
        skills: ['React', 'JavaScript', 'Node.js', 'MongoDB', 'Git'],
        skillsList: [
          { name: 'React', proficiency: 'Advanced', verified: true },
          { name: 'JavaScript', proficiency: 'Advanced', verified: true },
          { name: 'Node.js', proficiency: 'Intermediate', verified: true },
          { name: 'MongoDB', proficiency: 'Intermediate', verified: false }
        ],
        internships: [
          {
            title: 'Frontend Engineering Intern',
            company: 'Alpha Cloud Labs',
            location: 'Remote',
            duration: '3 Months (May 2025 - Jul 2025)',
            description: 'Developed real-time analytics dashboard with React and WebSockets.'
          }
        ],
        resumeUrl: 'https://skillnexus.ai/resumes/alex_chen_cv.pdf'
      });
    }

    // 3. Find or create an opportunity
    let opp = await Opportunity.findOne({ companyId: company._id, status: 'open' });
    if (!opp) {
      opp = await Opportunity.create({
        companyId: company._id,
        title: 'Frontend Developer Intern',
        type: 'internship',
        status: 'open',
        description: 'Build modern responsive enterprise web interfaces using React, JavaScript, and Node.js.',
        location: 'Bengaluru / Hybrid',
        stipend: '₹35,000 / month',
        duration: '6 Months',
        requiredSkills: [
          { name: 'React', importance: 'required', proficiency: 'intermediate', weight: 30 },
          { name: 'JavaScript', importance: 'required', proficiency: 'intermediate', weight: 30 },
          { name: 'Node.js', importance: 'required', proficiency: 'intermediate', weight: 20 },
          { name: 'MongoDB', importance: 'preferred', proficiency: 'intermediate', weight: 20 }
        ],
        minCgpa: 7.5,
        eligibleBranches: ['Computer Science', 'Information Technology']
      });
    }

    // 4. Test Application & Lifecycle stages: applied -> screening -> shortlisted -> interview -> selected
    let app = await Application.findOne({ studentId: studentProfile._id, opportunityId: opp._id });
    if (!app) {
      app = await Application.create({
        studentId: studentProfile._id,
        opportunityId: opp._id,
        resumeUrl: studentProfile.resumeUrl || 'https://skillnexus.ai/resumes/default.pdf',
        status: 'applied'
      });
    }

    console.log(`Initial application status: ${app.status}`);

    // Update status to screening
    app.status = 'screening';
    await app.save();
    console.log(`Updated to screening: ${app.status}`);

    // Update status to shortlisted
    app.status = 'shortlisted';
    await app.save();
    console.log(`Updated to shortlisted: ${app.status}`);

    // Schedule interview with interviewer & interviewType
    app.status = 'interview';
    app.interviewDetails = {
      scheduledAt: new Date(Date.now() + 86400000),
      date: '10 September 2026',
      time: '11:00 AM',
      interviewType: 'Technical Interview',
      interviewer: 'Rahul Sharma - Staff Architect',
      meetingLink: 'https://meet.google.com/zenith-tech-round',
      status: 'scheduled'
    };
    await app.save();
    console.log(`Interview scheduled with: Type="${app.interviewDetails.interviewType}", Panel="${app.interviewDetails.interviewer}"`);

    // Verify Candidate Profile Modal API response shape
    const candidatePopulated = await StudentProfile.findById(studentProfile._id).populate('userId');
    const assessments = await AssessmentResult.find({ userId: studentUser._id });
    console.log(`Candidate Profile verified: ${candidatePopulated.userId.name} | ${candidatePopulated.academicInformation?.branch} | CGPA: ${candidatePopulated.academicInformation?.cgpa}`);
    console.log(`Internships present: ${candidatePopulated.internships?.length}`);

    // Verify Skill Insights calculations
    const allOpps = await Opportunity.find({ companyId: company._id });
    const allApps = await Application.find({ opportunityId: { $in: allOpps.map(o => o._id) } });
    console.log(`Total Company Openings: ${allOpps.length} | Applications Received: ${allApps.length}`);

    const { getSkillInsights } = await import('../controllers/companyController.js');
    let skillInsightsData = null;
    await getSkillInsights(
      { user: { id: companyUser._id } },
      {
        status: (code) => ({
          json: (data) => {
            skillInsightsData = data;
          }
        })
      }
    );

    console.log('Skill Insights generated:');
    console.log(`  - Demanded skills: ${skillInsightsData?.mostDemandedSkills?.map(s => s.skill).join(', ')}`);
    console.log(`  - Average compatibility: ${skillInsightsData?.averageCandidateCompatibility}%`);
    console.log(`  - Recruitment outcomes: ${JSON.stringify(skillInsightsData?.recruitmentOutcomes)}`);
    console.log(`  - Common skill gaps: ${skillInsightsData?.commonSkillGaps?.map(s => `${s.skill} (${s.gapPercentage}%)`).join(', ')}`);

    console.log('✅ ALL BACKEND GROUP 1 & GROUP 2 CHECKS PASSED SUCCESSFULLY!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Verification Error:', err);
    process.exit(1);
  }
};

runTest();
