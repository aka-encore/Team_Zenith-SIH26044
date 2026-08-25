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

// Function to seed default demo accounts if database is empty
export async function seedDefaultUsersIfEmpty() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const student = new User({
        name: "Alex Chen",
        email: "student@test.com",
        passwordHash: "password123",
        role: "student",
        status: "active"
      });
      await student.save();

      await StudentProfile.findOneAndUpdate(
        { userId: student._id },
        {
          skills: ["React", "Node.js", "MongoDB", "Java", "Data Structures"],
          bio: "3rd Year Computer Science Student",
          education: { institutionName: "Zenith Institute of Technology", degree: "B.Tech", fieldOfStudy: "Computer Science", graduationYear: 2026 }
        },
        { upsert: true, new: true }
      );

      const company = new User({
        name: "TechNova Solutions",
        email: "company@test.com",
        passwordHash: "password123",
        role: "company",
        status: "active"
      });
      await company.save();

      await Company.findOneAndUpdate(
        { userId: company._id },
        {
          companyName: "TechNova Solutions",
          industry: "Enterprise Software & Cloud",
          location: "Bengaluru / Remote"
        },
        { upsert: true, new: true }
      );

      const inst = new User({
        name: "Zenith Institute Admin",
        email: "institution@test.com",
        passwordHash: "password123",
        role: "institution",
        status: "active"
      });
      await inst.save();
    }
  } catch (err) {
    // Ignore seed errors
  }
}

const connectDB = async () => {
  const atlasUri = process.env.MONGO_URL || process.env.MONGODB_URI;
  const localUri = "mongodb://127.0.0.1:27017/sih26044";

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
