const mongoose = require('mongoose');

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
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
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
  }
}, {
  timestamps: true // Automatically create createdAt and updatedAt
});

module.exports = mongoose.model('Company', CompanySchema);
