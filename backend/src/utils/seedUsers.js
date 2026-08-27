import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import Company from '../models/Company.js';

dotenv.config();

/**
 * Seeds default ready-to-use user accounts for testing all 4 roles:
 * 1. Student
 * 2. Faculty
 * 3. Company
 * 4. Admin
 */
async function seedUsers() {
  try {
    await connectDB();

    console.log('Seeding demo accounts into MongoDB for all 4 roles...');

    // Clear existing test accounts
    await User.deleteMany({
      email: { $in: ['student@test.com', 'faculty@test.com', 'company@test.com', 'admin@test.com', 'institution@test.com'] }
    });

    // 1. Student Account
    const studentUser = new User({
      name: 'Alex Chen',
      email: 'student@test.com',
      passwordHash: 'password123',
      role: 'student',
      status: 'active',
      emailVerified: true
    });
    await studentUser.save();
    console.log('✅ Created Student Account: student@test.com / password123');

    // 2. Faculty Account
    const facultyUser = new User({
      name: 'Dr. Rajesh Sharma (Faculty HOD)',
      email: 'faculty@test.com',
      passwordHash: 'password123',
      role: 'faculty',
      status: 'active',
      emailVerified: true
    });
    await facultyUser.save();
    console.log('✅ Created Faculty Account: faculty@test.com / password123');

    // 3. Company Account
    const companyUser = new User({
      name: 'TechNova Solutions',
      email: 'company@test.com',
      passwordHash: 'password123',
      role: 'company',
      status: 'active',
      emailVerified: true
    });
    await companyUser.save();
    console.log('✅ Created Company Account: company@test.com / password123');

    // 4. Admin Account
    const adminUser = new User({
      name: 'Team Zenith System Administrator',
      email: 'admin@test.com',
      passwordHash: 'password123',
      role: 'admin',
      status: 'active',
      emailVerified: true
    });
    await adminUser.save();
    console.log('✅ Created Admin Account: admin@test.com / password123');

    console.log('\n🎉 Seed process complete! All 4 demo accounts are active in MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
    process.exit(1);
  }
}

seedUsers();
