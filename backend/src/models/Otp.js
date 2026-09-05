import mongoose from 'mongoose';


const OtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },

  otp: {
    type: String,
    required: true,
  },

  purpose: {
    type: String,
    enum: ['login', 'register', 'forgot_password', 'profile_update'],
    default: 'login',
  },

  role: {
    type: String,
    default: null,
  },

  userData: {
    type: mongoose.Schema.Types.Mixed,
    default: null, // Temporary registration data if purpose is 'register'
  },

  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // Document automatically removed by MongoDB after 10 minutes (600s)
  }
});


export default mongoose.model('Otp', OtpSchema);
