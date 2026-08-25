import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import Company from '../models/Company.js';

dotenv.config();

/**
 * Seeds default ready-to-use user accounts for testing login.
 */
async function seedUsers() {
  try {
    await connectDB();

    console.log('Seeding demo accounts into MongoDB...');

    // Clear existing test accounts if needed
    await User.deleteMany({ email: { $in: ['student@test.com', 'company@test.com', 'institution@test.com', 'admin@test.com'] } });

    // 1. Create Demo Student Account
    const studentUser = new User({
      name: 'Alex Chen',
      email: 'student@test.com',
      passwordHash: 'password123',
      role: 'student',
      status: 'active'
    });
    await studentUser.save();
    console.log('✅ Created Student Account: student@test.com / password123');

    // Update student profile skills
    await StudentProfile.findOneAndUpdate(
      { userId: studentUser._id },
      {
        skills: ['React', 'Node.js', 'MongoDB', 'Java', 'Data Structures'],
        bio: '3rd Year Computer Science Student passionate about Fullstack Development.',
        education: { institutionName: 'Zenith Institute of Technology', degree: 'B.Tech', fieldOfStudy: 'Computer Science', graduationYear: 2026 }
      },
      { upsert: true, new: true }
    );

    // 2. Create Demo Company Account
    const companyUser = new User({
      name: 'TechNova Solutions',
      email: 'company@test.com',
      passwordHash: 'password123',
      role: 'company',
      status: 'active'
    });
    await companyUser.save();
    console.log('✅ Created Company Account: company@test.com / password123');

    await Company.findOneAndUpdate(
      { userId: companyUser._id },
      {
        companyName: 'TechNova Solutions',
        industry: 'Enterprise Software & Cloud',
        location: 'Bengaluru / Remote',
        description: 'Building cloud-native microservices platforms.'
      },
      { upsert: true, new: true }
    );

    // 3. Create Demo Institution / Admin Account
    const instUser = new User({
      name: 'Zenith Institute Admin',
      email: 'institution@test.com',
      passwordHash: 'password123',
      role: 'institution',
      status: 'active'
    });
    await instUser.save();
    console.log('✅ Created Institution Account: institution@test.com / password123');

    console.log('\n🎉 Seed process complete! All demo accounts are active and ready for login.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
    process.exit(1);
  }
}

seedUsers();
