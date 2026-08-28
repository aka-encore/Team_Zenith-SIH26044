import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // One-to-one relationship between User and Company Profile
  },
  companyName: {
    type: String,
    required: [true, 'Please add a company name'],
    trim: true
  },
  logoUrl: {
    type: String,
    default: '',
    trim: true
  },
  industry: {
    type: String,
    default: '',
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  website: {
    type: String,
    default: '',
    trim: true
  },
  location: {
    type: String,
    default: '',
    trim: true
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'suspended'],
    default: 'pending'
  },
  hrName: {
    type: String,
    default: '',
    trim: true
  },
  contactPhone: {
    type: String,
    default: '',
    trim: true
  },
  contactEmail: {
    type: String,
    default: '',
    trim: true
  },
  companySize: {
    type: String,
    default: '',
    trim: true
  },
  foundedYear: {
    type: String,
    default: '',
    trim: true
  },
  readNotifications: [{
    type: String
  }]
}, {
  timestamps: true // Automatically create createdAt and updatedAt
});

export default mongoose.model('Company', CompanySchema);

