import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import Application from '../models/Application.js';
import AssessmentResult from '../models/AssessmentResult.js';

dotenv.config();

async function removeFakeStudents() {
  try {
    await connectDB();
    console.log('\n--- Purging Fake Student Accounts from MongoDB ---');

    // Identify fake/seed student accounts
    const fakeCriteria = {
      role: 'student',
      $or: [
        { email: 'student@test.com' },
        { email: { $regex: /test\.com$/i } },
        { email: { $regex: /example\.com$/i } },
        { name: 'Alex Chen' },
        { name: { $regex: /test student|dummy student/i } }
      ]
    };

    const fakeStudents = await User.find(fakeCriteria);
    console.log(`Found ${fakeStudents.length} fake student user(s) to remove.`);

    for (const s of fakeStudents) {
      console.log(`🗑️ Deleting fake student: ${s.name} (${s.email}) [ID: ${s._id}]`);
      
      // Remove StudentProfile
      await StudentProfile.deleteMany({ userId: s._id });
      // Remove Applications
      await Application.deleteMany({ studentId: s._id });
      // Remove Assessment Results
      await AssessmentResult.deleteMany({ studentId: s._id });
      // Remove User account
      await User.deleteOne({ _id: s._id });
    }

    // List remaining real student accounts
    const remainingStudents = await User.find({ role: 'student' }).select('name email role createdAt');
    console.log(`\n✅ Finished purge! Remaining real student accounts in MongoDB: ${remainingStudents.length}`);
    for (const r of remainingStudents) {
      console.log(`   - Real Student: "${r.name}" | Email: "${r.email}" | Joined: ${r.createdAt}`);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error removing fake students:', err);
    process.exit(1);
  }
}

removeFakeStudents();
