import mongoose from 'mongoose';

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
    enum: ['applied', 'reviewed', 'shortlisted', 'interview', 'interviewing', 'selected', 'accepted', 'rejected'],
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
  },
  interviewDetails: {
    scheduledAt: { type: Date },
    date: { type: String, default: '' },
    time: { type: String, default: '' },
    mode: { type: String, default: 'video' },
    round: { type: String, default: 'Technical Round 1' },
    meetingLink: { type: String, default: '' },
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'Scheduled', 'Completed', 'Cancelled'],
      default: 'scheduled'
    }
  },
  placementDetails: {
    isPlaced: { type: Boolean, default: false },
    placedAt: { type: Date },
    package: { type: String, default: '' },
    designation: { type: String, default: '' },
    location: { type: String, default: '' },
    joiningDate: { type: Date },
    offerLetterUrl: { type: String, default: '' }
  }
}, {
  timestamps: true
});

// Enforce compound unique constraint so a student can only apply once to any opportunity
ApplicationSchema.index({ studentId: 1, opportunityId: 1 }, { unique: true });
ApplicationSchema.index({ opportunityId: 1, status: 1 });
ApplicationSchema.index({ studentId: 1, createdAt: -1 });

export default mongoose.model('Application', ApplicationSchema);
