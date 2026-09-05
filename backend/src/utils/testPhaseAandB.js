import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Company from '../models/Company.js';
import StudentProfile from '../models/StudentProfile.js';
import Opportunity from '../models/Opportunity.js';
import { calculateDetailedCompatibility, extractStructuredOpportunitySkills } from './matchingEngine.js';
import { loadEnv } from './loadEnv.js';

loadEnv(import.meta.url);

const runPhaseAandBTests = async () => {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('  SIH26044 PHASE A & PHASE B VERIFICATION SUITE');
  console.log('════════════════════════════════════════════════════════════════\n');

  try {
    const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sih26044';
    await mongoose.connect(dbUri);
    console.log('[1/5] Connected to MongoDB database successfully.');

    // 1. Setup Test Company User & Company Profile
    const companyEmail = 'phase_test_company@corporate.com';
    await User.deleteMany({ email: companyEmail });
    const companyUser = await User.create({
      name: 'Innovatech Corp',
      email: companyEmail,
      passwordHash: 'SecurePassword123!',
      role: 'company',
      status: 'active'
    });

    let company = await Company.findOne({ userId: companyUser._id });
    if (!company) {
      company = await Company.create({
        userId: companyUser._id,
        companyName: 'Innovatech Corp',
        industry: 'Software & Cloud',
        location: 'Bengaluru, Karnataka',
        verificationStatus: 'verified'
      });
    } else {
      company.verificationStatus = 'verified';
      await company.save();
    }
    console.log('[2/5] Verified Company Profile set up:', company.companyName);

    // 2. PHASE A TEST: Create Opportunity with Structured Required Skills
    console.log('\n--- TESTING PHASE A: STRUCTURED REQUIRED SKILLS ---');
    const structuredSkillsInput = [
      {
        name: "React",
        importance: "required",
        proficiency: "intermediate",
        weight: 30
      },
      {
        name: "JavaScript",
        importance: "required",
        proficiency: "intermediate",
        weight: 30
      },
      {
        name: "Node.js",
        importance: "preferred",
        proficiency: "beginner",
        weight: 20
      }
    ];

    const opportunity = await Opportunity.create({
      companyId: company._id,
      title: 'Senior Frontend / Fullstack Engineer',
      type: 'job',
      description: 'Develop responsive single-page applications and backend microservices.',
      requiredSkills: structuredSkillsInput,
      location: 'Hybrid - Bengaluru',
      stipend: '₹12,00,000 / year',
      minCgpa: 7.5,
      eligibleBranches: ['Computer Science', 'Information Technology', 'Software Engineering'],
      eligibleYears: ['4th Year', '2025', '2026'],
      status: 'open'
    });

    // Verify stored in MongoDB as structured objects
    const savedOpp = await Opportunity.findById(opportunity._id);
    if (!savedOpp) throw new Error('Failed to save opportunity in MongoDB!');

    console.log('Saved Opportunity ID:', savedOpp._id);
    console.log('Saved requiredSkills in MongoDB:', JSON.stringify(savedOpp.requiredSkills, null, 2));

    if (!Array.isArray(savedOpp.requiredSkills) || savedOpp.requiredSkills.length !== 3) {
      throw new Error(`Expected 3 structured skills, got ${savedOpp.requiredSkills?.length}`);
    }

    const firstSkill = savedOpp.requiredSkills[0];
    if (firstSkill.name !== 'React' || firstSkill.importance !== 'required' || firstSkill.proficiency !== 'intermediate' || firstSkill.weight !== 30) {
      throw new Error('Phase A FAIL: Skill structure does not match expected schema: ' + JSON.stringify(firstSkill));
    }
    console.log('✓ PASS: Phase A - Opportunity requiredSkills stored as structured format in MongoDB.');

    // 3. PHASE B TEST: Setup Test Candidates with varied proficiencies
    console.log('\n--- TESTING PHASE B: SKILL COMPATIBILITY ENGINE ---');

    // Candidate 1: Strong Match (React Expert, JS Intermediate, Node.js Beginner, CGPA 8.8, CS Branch)
    const strongStudent = {
      _id: new mongoose.Types.ObjectId(),
      userId: { name: 'Priya Sharma', email: 'priya.sharma@example.com' },
      academicInformation: {
        college: 'Zenith Institute of Technology',
        branch: 'Computer Science',
        degree: 'B.Tech',
        year: '4th Year',
        cgpa: 8.8
      },
      skillsList: [
        { name: 'React', proficiency: 'Expert' },
        { name: 'JavaScript', proficiency: 'Intermediate' },
        { name: 'Node.js', proficiency: 'Beginner' }
      ],
      skills: ['React', 'JavaScript', 'Node.js', 'Git'],
      careerInterests: ['Frontend Development', 'Fullstack Engineer', 'Web Applications']
    };

    // Candidate 2: Partial Match (React Beginner, JS Beginner, missing Node.js, CGPA 7.0 below minCgpa 7.5)
    const partialStudent = {
      _id: new mongoose.Types.ObjectId(),
      userId: { name: 'Rahul Verma', email: 'rahul.verma@example.com' },
      academicInformation: {
        college: 'Zenith Institute of Technology',
        branch: 'Mechanical Engineering', // Outside eligible branch
        degree: 'B.Tech',
        year: '2nd Year', // Outside eligible year
        cgpa: 6.8 // Below 7.5
      },
      skillsList: [
        { name: 'React', proficiency: 'Beginner' },
        { name: 'JavaScript', proficiency: 'Beginner' }
      ],
      skills: ['React', 'JavaScript'],
      careerInterests: ['Automotive Systems']
    };

    // Candidate 3: Zero Match
    const zeroStudent = {
      _id: new mongoose.Types.ObjectId(),
      userId: { name: 'Ananya Roy', email: 'ananya.roy@example.com' },
      academicInformation: {
        college: 'State University',
        branch: 'Civil Engineering',
        degree: 'B.Tech',
        year: '1st Year',
        cgpa: 6.0
      },
      skillsList: [
        { name: 'AutoCAD', proficiency: 'Intermediate' }
      ],
      skills: ['AutoCAD'],
      careerInterests: ['Structural Design']
    };

    // Run Skill Compatibility Engine on Candidate 1
    const match1 = calculateDetailedCompatibility(strongStudent, savedOpp);
    console.log('\nCandidate 1 (Priya Sharma - Strong Match):');
    console.log('Compatibility Score:', match1.compatibilityScore + '%');
    console.log('Matched Skills:', match1.matchedSkills);
    console.log('Missing Skills:', match1.missingSkills);
    console.log('Breakdown:', match1.breakdown);

    if (match1.compatibilityScore < 85) {
      throw new Error(`Expected Candidate 1 compatibility score >= 85%, got ${match1.compatibilityScore}%`);
    }
    if (match1.breakdown.isEligible !== true) {
      throw new Error('Candidate 1 should be eligible (CS branch, 4th Year, CGPA 8.8)');
    }
    if (match1.matchedSkills.length !== 3) {
      throw new Error(`Expected 3 matched skills, got ${match1.matchedSkills.length}`);
    }
    console.log('✓ PASS: Candidate 1 compatibility calculated with transparent breakdown.');

    // Run Skill Compatibility Engine on Candidate 2
    const match2 = calculateDetailedCompatibility(partialStudent, savedOpp);
    console.log('\nCandidate 2 (Rahul Verma - Partial Match & Ineligible):');
    console.log('Compatibility Score:', match2.compatibilityScore + '%');
    console.log('Matched Skills:', match2.matchedSkills);
    console.log('Missing Skills:', match2.missingSkills);
    console.log('Is Eligible:', match2.breakdown.isEligible);
    console.log('Eligibility Reasons:', match2.breakdown.eligibilityReasons);

    if (match2.breakdown.isEligible !== false) {
      throw new Error('Candidate 2 should be flagged as ineligible due to Branch, Year, and CGPA');
    }
    if (match2.compatibilityScore >= match1.compatibilityScore) {
      throw new Error('Candidate 2 score must be significantly lower than Candidate 1');
    }
    console.log('✓ PASS: Candidate 2 partial match and ineligibility handled correctly.');

    // Run Skill Compatibility Engine on Candidate 3
    const match3 = calculateDetailedCompatibility(zeroStudent, savedOpp);
    console.log('\nCandidate 3 (Ananya Roy - Zero Match):');
    console.log('Compatibility Score:', match3.compatibilityScore + '%');
    console.log('Matched Skills:', match3.matchedSkills);
    console.log('Missing Skills:', match3.missingSkills);

    if (match3.matchedSkills.length !== 0 || match3.compatibilityScore > 35) {
      throw new Error('Expected 0 matched skills and very low score for Candidate 3');
    }
    console.log('✓ PASS: Candidate 3 zero skill match handled correctly.');

    // 4. TEST REST API via HTTP call to running server (http://localhost:5000)
    console.log('\n--- TESTING HTTP REST API: /api/company/recommended-candidates ---');
    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_sih26044_2024';
    const testToken = jwt.sign(
      { id: companyUser._id, role: 'company', email: companyUser.email },
      secret,
      { expiresIn: '1h' }
    );

    const httpRes = await fetch(`http://localhost:5000/api/company/recommended-candidates?opportunityId=${savedOpp._id}`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });

    const httpJson = await httpRes.json();
    console.log('HTTP Status:', httpRes.status);
    console.log('API Response success:', httpJson.success);
    console.log('API Active Opportunity Title:', httpJson.activeOpportunity?.title);
    console.log('API Active Opportunity Required Skills:', httpJson.activeOpportunity?.requiredSkills);
    console.log('API Total Candidates Returned:', httpJson.candidates?.length);

    if (!httpRes.ok || !httpJson.success) {
      throw new Error('API request failed: ' + (httpJson.message || httpRes.statusText));
    }
    if (!httpJson.activeOpportunity || httpJson.activeOpportunity.requiredSkills.length !== 3) {
      throw new Error('API did not return activeOpportunity with 3 structured skills');
    }

    // Clean up test opportunity and company
    await Opportunity.findByIdAndDelete(savedOpp._id);
    await User.findByIdAndDelete(companyUser._id);
    await Company.findByIdAndDelete(company._id);
    console.log('\nCleaned up test records from MongoDB.');

    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('  ALL PHASE A & PHASE B TESTS PASSED WITH 100% SUCCESS!');
    console.log('════════════════════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST SUITE FAILED:', err.message);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
};

runPhaseAandBTests();
