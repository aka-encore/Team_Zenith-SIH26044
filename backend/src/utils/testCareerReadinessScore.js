import './loadEnv.js';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import Opportunity from '../models/Opportunity.js';
import AssessmentResult from '../models/AssessmentResult.js';

const testReadinessScore = async () => {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('          CAREER READINESS SCORE CALCULATION TEST SUITE          ');
  console.log('════════════════════════════════════════════════════════════════\n');

  try {
    await connectDB();

    const studentUser = await User.findOne({ role: 'student' });
    if (!studentUser) throw new Error('Student user not found.');

    let profile = await StudentProfile.findOne({ userId: studentUser._id });
    if (!profile) {
      profile = await StudentProfile.create({
        userId: studentUser._id,
        skills: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
        academicInformation: {
          college: 'Zenith Institute of Technology',
          department: 'Computer Science',
          cgpa: 8.9
        }
      });
    }

    // Set sample real profile data
    profile.skillsList = [
      { name: 'React', category: 'Frontend', proficiency: 'Advanced' },
      { name: 'Node.js', category: 'Backend', proficiency: 'Advanced' },
      { name: 'MongoDB', category: 'Database', proficiency: 'Intermediate' },
      { name: 'JavaScript', category: 'Languages', proficiency: 'Expert' }
    ];
    profile.projects = [
      {
        title: 'Cloud Orchestration Platform',
        description: 'Microservices manager built with Node.js and React.',
        technologies: ['React', 'Node.js', 'Docker'],
        githubUrl: 'https://github.com/alex/cloud-platform'
      }
    ];
    profile.resumeUrl = 'https://storage.googleapis.com/resumes/alex_chen_resume.pdf';
    await profile.save();

    // 1. Test Mock Endpoint Invocation
    const req = { user: { id: studentUser._id } };
    let jsonResult = null;
    let statusCode = null;

    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => {
            jsonResult = data;
          }
        };
      }
    };

    const { getCareerReadinessScore } = await import('../controllers/studentController.js');
    await getCareerReadinessScore(req, res);

    if (statusCode !== 200 || !jsonResult.success) {
      throw new Error(`Failed to calculate score: ${JSON.stringify(jsonResult)}`);
    }

    console.log(`✓ Career Readiness Score Calculated: ${jsonResult.score} / 100 (${jsonResult.tier})`);
    console.log(`  • Skill Strength: ${jsonResult.breakdown.skillStrength.score} / 25 (${jsonResult.breakdown.skillStrength.percentage}%)`);
    console.log(`  • Assessment Strength: ${jsonResult.breakdown.assessmentStrength.score} / 20 (${jsonResult.breakdown.assessmentStrength.percentage}%)`);
    console.log(`  • Project Strength: ${jsonResult.breakdown.projectStrength.score} / 20 (${jsonResult.breakdown.projectStrength.percentage}%)`);
    console.log(`  • Profile & Resume: ${jsonResult.breakdown.profileCompleteness.score} / 15 (${jsonResult.breakdown.profileCompleteness.percentage}%)`);
    console.log(`  • Academic Standing: ${jsonResult.breakdown.academicStanding.score} / 10 (${jsonResult.breakdown.academicStanding.percentage}%)`);
    console.log(`  • Certifications: ${jsonResult.breakdown.certifications.score} / 10 (${jsonResult.breakdown.certifications.percentage}%)`);

    console.log('\n── Positive Factors (Boosting Score):');
    jsonResult.explainability.positiveFactors.forEach(f => console.log(`  + ${f}`));

    console.log('\n── Improvement Areas:');
    jsonResult.explainability.improvementAreas.forEach(f => console.log(`  ▲ ${f}`));

    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('       CAREER READINESS SCORE ENGINE TEST PASSED (100%)         ');
    console.log('════════════════════════════════════════════════════════════════\n');

  } catch (err) {
    console.error('\n!!! Career Readiness Score Test Failed !!!');
    console.error(err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

testReadinessScore();
