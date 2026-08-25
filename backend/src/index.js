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

// 7. Parse JSON request bodies (e.g. req.body)
app.use(express.json());

// 8. Register API route handlers
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/institutions', institutionRoutes);

// Database connection status labels
const dbStateNames = { 0: 'DISCONNECTED', 1: 'CONNECTED', 2: 'CONNECTING', 3: 'DISCONNECTING' };

// 9. Simple Health Check endpoint to test backend status
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        message: 'Backend server is running successfully.',
        database: dbStateNames[mongoose.connection.readyState] || 'UNKNOWN',
        timestamp: new Date().toISOString()
    });
});

// 10. Start server on PORT (default 5000)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
