import mongoose from "mongoose";
import dns from "dns";

// 1. Set DNS servers (1.1.1.1 and 8.8.8.8) to fix Windows DNS lookup issues with MongoDB Atlas
dns.setServers([
    "1.1.1.1",
    "8.8.8.8"
]);

// 2. Async function to connect to MongoDB database
const connectDB = async () => {
    try {
        console.log("Connecting to MongoDB...");

        // Use MONGO_URL or MONGODB_URI environment variable
        const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sih26044";

        await mongoose.connect(mongoUrl, {
            serverSelectionTimeoutMS: 5000
        });

        console.log("MongoDB Connected");
    } catch (error) {
        console.error("MongoDB Connection Error:", error.message);
    }
};

export default connectDB;
