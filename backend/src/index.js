import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';


// 1. Import database connection helper
import connectDB from './config/db.js';


// 2. Import API routes
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import opportunityRoutes from './routes/opportunityRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import institutionRoutes from './routes/institutionRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import questionRoutes from './routes/questionRoutes.js';


import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// 3. Load environment variables from .env file
dotenv.config();


// 4. Connect to MongoDB database
connectDB();


// 5. Create Express application instance
const app = express();


// 6. Enable CORS so React frontend (http://localhost:5173) can talk to Express backend
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
    credentials: true
}));


// 7. Parse JSON request bodies
app.use(express.json());


// 7b. Serve static uploaded files (Profile Photos, Resumes, etc.)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


// 8. Register API route handlers
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/questions', questionRoutes);


// 9. Simple Health Check endpoint to test backend status
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        message: 'Backend server is running successfully.',
        database: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
        timestamp: new Date().toISOString()
    });
});


// 10. Start server on PORT (default 5000)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


export default app;
