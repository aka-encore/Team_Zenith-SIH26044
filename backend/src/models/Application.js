const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  opportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentProfile',
    required: true
  },
  status: {
    type: String,
    enum: ['applied', 'reviewed', 'shortlisted', 'accepted', 'rejected'],
    default: 'applied'
  },
  resumeUrl: {
    type: String,
    required: [true, 'Please provide a reference resume URL for this application'],
    trim: true
  },
  coverLetter: {
    type: String,
    default: '',
    trim: true
  }
}, {
  timestamps: true
});

// Enforce compound unique constraint so a student can only apply once to any opportunity
ApplicationSchema.index({ studentId: 1, opportunityId: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);
