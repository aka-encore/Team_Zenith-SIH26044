import mongoose from "mongoose";
import dns from "dns";
import User from "../models/User.js";
import StudentProfile from "../models/StudentProfile.js";
import Company from "../models/Company.js";
import { error } from "console";

// Set DNS servers for Atlas SRV lookup
try {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
} catch (e) {
  console.log("Error to connect dns", error);
}

// Function to seed default demo accounts if database is empty or ensure seed users exist
export async function seedDefaultUsersIfEmpty() {
  try {
    const seedAccounts = [
      { name: "Alex Chen", email: "student@test.com", password: "password123", role: "student" },
      { name: "TechNova Solutions", email: "company@test.com", password: "password123", role: "company" },
      { name: "Zenith Institute Admin", email: "institution@test.com", password: "password123", role: "institution" },
      { name: "Dr. Arvind Sharma", email: "faculty@test.com", password: "password123", role: "faculty" },
      { name: "Test Faculty (DEV/TEST)", email: "faculty.test@example.com", password: "Test@12345", role: "faculty" },
      { name: "System Admin", email: "admin@test.com", password: "password123", role: "admin" }
    ];

    for (const acc of seedAccounts) {
      let user = await User.findOne({ email: acc.email });
      if (!user) {
        user = new User({
          name: acc.name,
          email: acc.email,
          passwordHash: acc.password,
          role: acc.role,
          status: "active",
          emailVerified: true
        });
        await user.save();
      }

      if (acc.role === "student") {
        await StudentProfile.findOneAndUpdate(
          { userId: user._id },
          {
            skills: ["React", "Node.js", "MongoDB", "Java", "Data Structures"],
            bio: "3rd Year Computer Science Student",
            academicInformation: { college: "Zenith Institute of Technology & Engineering", degree: "B.Tech", branch: "Computer Science", cgpa: 8.9 }
          },
          { upsert: true }
        );
      } else if (acc.role === "company") {
        await Company.findOneAndUpdate(
          { userId: user._id },
          {
            companyName: "TechNova Solutions",
            industry: "Enterprise Software & Cloud",
            location: "Bengaluru / Remote",
            verificationStatus: "verified"
          },
          { upsert: true }
        );
      }
    }
  } catch (err) {
    // Ignore seed errors
  }
}

const connectDB = async () => {
  const atlasUri = process.env.MONGO_URL || process.env.MONGODB_URI;
  const localUri = "mongodb://127.0.0.1:27017/skillnexus_ai";

  console.log("Connecting to MongoDB...");

  // 1. Try Primary Atlas Configured URI
  if (atlasUri) {
    try {
      await mongoose.connect(atlasUri, { serverSelectionTimeoutMS: 3000 });
      console.log(" MongoDB Connected !! ");
      await seedDefaultUsersIfEmpty();
      return;
    } catch (error) {
      console.log("MongoDB Connection Error` !! ", error);
    }
  }

  // 2. Try Local MongoDB Instance
  try {
    await mongoose.connect(localUri, { serverSelectionTimeoutMS: 2000 });
    console.log("MongoDB Connected !! ");
    await seedDefaultUsersIfEmpty();
    return;
  } catch (fallbackError) {
    console.log("MongoDB Connection Error !! ", fallbackError);
  }

  // 3. Fallback to In-Memory MongoDB Server (Zero-noise fallback)
  try {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const mongoServer = await MongoMemoryServer.create();
    const memoryUri = mongoServer.getUri();
    await mongoose.connect(memoryUri);
    console.log("MongoDB Connected !! ");
    await seedDefaultUsersIfEmpty();
  } catch (memErr) {
    console.error("MongoDB connection error:", memErr.message);
  }
};

export default connectDB;
